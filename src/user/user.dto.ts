import mongoose from "mongoose";
import { BaseSchema } from "../common/dto/base.dto";

export interface IUser extends BaseSchema {
    _id: string;
    email: string;
    password: string;
    role: string;
    pancard: string;
    phone?: string;
    payment: mongoose.Schema.Types.ObjectId[]; // Assuming content is a reference to another schema
    name: string;
    refreshToken: string;
}
