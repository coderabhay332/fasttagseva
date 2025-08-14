

import { BaseSchema } from "../common/dto/base.dto";
export interface IPayment extends BaseSchema {
    _id: string;
    amount: number;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    paymentStatus: string; // e.g., "PENDING", "COMPLETED", "FAILED"
    transactionId?: string; // Optional, if applicable
}