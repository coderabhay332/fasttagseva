import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import crypto from "crypto";
import Payment from "./payment.schema";
import userSchema from "../user/user.schema";
import { createResponse } from "../common/helper/response.helper";

export const verifyWebhook = asyncHandler(async (req: Request, res: Response) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET || '';
  const signature = req.headers['x-razorpay-signature'] as string | undefined;
  const rawBody = (req as any).body instanceof Buffer ? (req as any).body : Buffer.from((req as any).body || '');

  console.log(webhookSecret, signature, rawBody)
  if (!signature || !webhookSecret) {
    res.status(400).json(createResponse(null, "Missing webhook signature or secret"));
    return;
  }

  const expected = crypto
    .createHmac('sha256', webhookSecret)
    .update(rawBody)
    .digest('hex');

  if (expected !== signature) {
    res.status(400).json(createResponse(null, "Invalid webhook signature"));
    return;
  }

  try {
    const event = JSON.parse(rawBody.toString());
    const eventType = event.event as string;
    console.log("Webhook verified:", { event: eventType });

    const updatePaymentFromWebhook = async (
      eventType: string,
      plEntity?: any,
      payEntity?: any,
      rawEvent?: any
    ) => {
      try {
        console.log('updatePaymentFromWebhook called with:', { eventType, plEntity, payEntity }); // <-- Add this
        const paymentLinkId: string | undefined = plEntity?.id || payEntity?.link_id;
        const paymentId: string | undefined = payEntity?.id;
        if (!paymentLinkId && !paymentId) {
          console.error('Missing identifiers from webhook', { plEntity, payEntity });
          return { success: false, message: 'Missing identifiers from webhook' };
        }

        // Determine status
        let sourceStatus = (plEntity?.status || payEntity?.status || rawEvent?.payload?.payment_link?.entity?.status || '').toLowerCase();

        // Map 'created' to 'PAID' only for successful payment events
        if (
          sourceStatus === 'created' &&
          (eventType === 'payment.link.paid' || eventType === 'payment.captured')
        ) {
          sourceStatus = 'paid';
        }

        console.log("sourceStatus", sourceStatus)
        let mappedStatus: 'PAID' | 'FAILED' | 'CANCELLED' | 'ATTEMPTED' = 'ATTEMPTED';
        if (sourceStatus === 'paid' || sourceStatus === 'captured') mappedStatus = 'PAID';
        else if (sourceStatus === 'failed') mappedStatus = 'FAILED';
        else if (sourceStatus === 'cancelled' || sourceStatus === 'expired') mappedStatus = 'CANCELLED';
        else if (sourceStatus === 'partially_paid') mappedStatus = 'ATTEMPTED';

        const filter: any = { orderId: paymentLinkId };
        const updateData: any = {
          paymentStatus: mappedStatus,
          'response.webhook': rawEvent || null
        };
        if (paymentId) updateData.paymentId = paymentId;
        const ts = payEntity?.created_at || plEntity?.updated_at || plEntity?.created_at;
        if (ts) updateData.paymentDate = new Date(Number(ts) * 1000);

        const updatedPayment = await Payment.findOneAndUpdate(filter, updateData, { new: true });
        if (!updatedPayment) {
          console.error('Payment record not found for webhook identifiers', { filter, updateData });
          return { success: false, message: 'Payment record not found for webhook identifiers' };
        }

        // Ensure user has reference to this payment
        if (updatedPayment.user) {
          await userSchema.findByIdAndUpdate(
            updatedPayment.user,
            { $addToSet: { payment: updatedPayment._id } },
            { new: true }
          );
        }
        return { success: true, payment: updatedPayment };
      } catch (err) {
        console.error('Error in updatePaymentFromWebhook:', err);
        return { success: false, message: 'Internal error in payment update', error: err };
      }
    };

    if (eventType === 'payment_link.paid' || eventType === 'payment_link.cancelled' || eventType === 'payment_link.partially_paid' || eventType === 'payment_link.expired') {
      const pl = event.payload?.payment_link?.entity;
      const pay = event.payload?.payment?.entity; // might be undefined for link events
      console.log('Webhook payload:', { pl, pay, eventType }); // <-- Add this
      const result = await updatePaymentFromWebhook(eventType, pl, pay, event);
      if (!result.success) {
        res.status(400).json({ success: false, message: result.message, error: (result as any).error });
        return;
      }
      res.json(createResponse(result.payment, "Webhook processed"));
      return;
    }

    if (eventType === 'payment.captured' || eventType === 'payment.failed') {
      const pay = event.payload?.payment?.entity;
      const pl = undefined;
      console.log('Webhook payload:', { pl, pay, eventType }); // <-- Add this
      const result = await updatePaymentFromWebhook(eventType, pl, pay, event);
      if (!result.success) {
        res.status(400).json({ success: false, message: result.message, error: (result as any).error });
        return;
      }
      res.json(createResponse(result.payment, "Webhook processed"));
      return;
    }

    res.status(400).json(createResponse(null, "Unhandled event type"));
  } catch (err) {
    console.error('Webhook processing error:', err);
    res.status(500).json(createResponse("Webhook processing error", String(err)));
  }
});


