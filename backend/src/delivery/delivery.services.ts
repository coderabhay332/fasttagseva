import { DeliverySchema } from "./delivery.schema";
import { DeliveryAddress } from "./delivery.dto";
export const createDelivery = async (userId: string, orderId: string, deliveryAddress: DeliveryAddress, trackingNumber: string) => {
    const delivery = await DeliverySchema.create({ userId, orderId, deliveryAddress, trackingNumber });
    return delivery;
};

export const getDelivery = async (userId: string) => {
    const delivery = await DeliverySchema.find({ userId });
    return delivery;
};

export const updateDelivery = async (userId: string, orderId: string, deliveryAddress: DeliveryAddress, trackingNumber: string) => {
    const delivery = await DeliverySchema.findOneAndUpdate({ userId, orderId }, { deliveryAddress, trackingNumber });
    return delivery;
};