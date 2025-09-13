import { Request, Response } from "express";
import * as deliveryService from "./delivery.services";
import asyncHandler from "express-async-handler";


export const createDelivery = asyncHandler(async (req: Request, res: Response) => {
    const { orderId, deliveryAddress, trackingNumber } = req.body;
    const delivery = await deliveryService.createDelivery(req.user?._id as string, orderId, deliveryAddress, trackingNumber);
    res.status(201).json(delivery);
});
export const getDelivery = asyncHandler(async (req: Request, res: Response) => {
    const delivery = await deliveryService.getDelivery(req.user?._id as string);
    res.status(200).json(delivery);
});
export const updateDelivery = asyncHandler(async (req: Request, res: Response) => {
    const { orderId, deliveryAddress, trackingNumber } = req.body;
    const delivery = await deliveryService.updateDelivery(req.user?._id as string, orderId, deliveryAddress, trackingNumber);
    res.status(200).json(delivery);
});