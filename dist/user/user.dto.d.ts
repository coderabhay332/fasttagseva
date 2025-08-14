import mongoose from "mongoose";
import { BaseSchema } from "../common/dto/base.dto";
export interface IUser extends BaseSchema {
    _id: string;
    email: string;
    password: string;
    role: string;
    content: mongoose.Schema.Types.ObjectId[];
    name: string;
    refreshToken: string;
}
//# sourceMappingURL=user.dto.d.ts.map