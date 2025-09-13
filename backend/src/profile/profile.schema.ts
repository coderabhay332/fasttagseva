import { model, Schema } from "mongoose";
import { IProfile } from "./profile.dto";

const profileSchema = new Schema<IProfile>({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    phone: { type: String, required: true },
    pancard: { type: String, required: true },
    pancardNumber: { type: String, required: true },
    dateOfBirth: { type: String, required: true },
});

export const Profile = model<IProfile>("Profile", profileSchema);