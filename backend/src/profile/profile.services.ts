import { Profile } from "./profile.schema";
import { IProfile } from "./profile.dto";
import { uploadImage } from "../common/services/cloudinary.services";

export const getProfile = async (userId: string) => {
  const profile = await Profile.findOne({ userId });
  return profile;
};

export const updateProfile = async (
    userId: string,
    profileData: Partial<IProfile>
) => {
  
    const updated = await Profile.findOneAndUpdate(
      { userId },
      { userId, ...profileData },
      { new: true, upsert: true }
    );
    console.log("Profile upserted result:", updated);

    return updated;     
};

export const uploadPanimage = async (file: Express.Multer.File, userId: string) => {
  if (!file) throw new Error("No file provided for upload");

  const userFolder = `users/${userId}/`;

  try {
    const result: string = await uploadImage(file, userFolder);
    return { url: result };
  } catch (error) {
    console.error("Error uploading image:", error);
    throw new Error('Failed to upload image');
  }
}