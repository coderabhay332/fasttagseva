import { model, Schema } from "mongoose";
import { DeliveryDto } from "./delivery.dto";
const deliverySchema = new Schema<DeliveryDto>({
    orderId: {
        type: String,
        required: true,
    },
    deliveryStatus: {
        type: String,
        required: false,
        default: "pending",
    },
    deliveryAddress: {
        type: Object,
        required: true,
    },
    trackingNumber: {
        type: String,
        required: false,
    },
},)

export const DeliverySchema = model<DeliveryDto>("Delivery", deliverySchema);
