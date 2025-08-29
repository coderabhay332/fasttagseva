import mongoose, { Mongoose } from "mongoose";
import { BaseSchema } from "../common/dto/base.dto";

interface ApplicationStatus {
    [key: string]: string;
}

interface IApplication extends BaseSchema {
  userId: mongoose.Schema.Types.ObjectId;
  vehicle: string;
  engineNumber: string;
  chasisNumber: string;
  status: ApplicationStatus;
  panImage: string;
  rcImage: string;
  vehicleFrontImage: string;
  vehicleSideImage: string;
}