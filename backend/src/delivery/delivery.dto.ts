import { BaseSchema } from "../common/dto/base.dto";
import mongoose from "mongoose";
export interface DeliveryAddress {
  pincode: string;
  nearby?: string;   
  address: string;
  houseNumber: string;
}

export interface DeliveryDto extends BaseSchema {
  userId: mongoose.Schema.Types.ObjectId;
  orderId: string;
  deliveryStatus: string;
  deliveryAddress: DeliveryAddress;
  trackingNumber: string;
}
