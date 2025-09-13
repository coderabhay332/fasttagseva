import mongoose, { Mongoose } from "mongoose";
import { BaseSchema } from "../common/dto/base.dto"
export interface IProfile extends BaseSchema {
  userId: mongoose.Schema.Types.ObjectId,
  phone: string,
  pancard: string,
  pancardNumber: string,
  dateOfBirth: string,

}
