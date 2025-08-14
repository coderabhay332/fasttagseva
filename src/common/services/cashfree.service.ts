import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const APP_ID = process.env.CASHFREE_APP_ID!;
const SECRET_KEY = process.env.CASHFREE_SECRET_KEY!;
const BASE_URL =
  process.env.CASHFREE_ENV === 'PROD'
    ? 'https://api.cashfree.com/pg'
    : 'https://sandbox.cashfree.com/pg';

export const createPaymentLink = async ({
  orderId,
  amount,
  customerPhone,
  customerName,
  customerEmail,
}: {
  orderId: string;
  amount: number;
  customerPhone: string;
  customerName: string;
  customerEmail: string;
}) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/orders`,
      {
        order_id: orderId,
        order_amount: amount,
        order_currency: 'INR',
        customer_details: {
          customer_id: customerPhone,
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone,
        },
        order_meta: {
          return_url: `https://yourwebsite.com/verify?order_id={order_id}`,
          notify_url: `https://yourbackend.com/webhook/cashfree`,
        },
        payment_methods: ['upi'],
      },
      {
        headers: {
          'x-api-version': '2022-09-01',
          'Content-Type': 'application/json',
          'x-client-id': APP_ID,
          'x-client-secret': SECRET_KEY,
        },
      }
    );

    return response.data;
  } catch (err: any) {
    throw new Error(err?.response?.data?.message || 'Cashfree Payment Link Error');
  }
};
