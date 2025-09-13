import { Application } from "./application.schema";
import {uploadImage} from "../common/services/cloudinary.services";
import createHttpError from "http-errors";
import { Profile } from "../profile/profile.schema";
interface IApplication {
  vehicle: string;
  chasisNumber: string;
  status?: "NOT SUBMITTED" | "PENDING" | "AGENT ASSIGNED" | "REJECTED" | "DONE";
}

export const createApplication = async (userId: string, applicationData: IApplication) => {

    const application = new Application({ ...applicationData, userId });
    application.status = "PENDING";
    await application.save();

    return application;
};


export const updateStatus = async (
  updateData: { id: string, status: IApplication["status"] }
) => {
  const application = await Application.findOne({ _id: updateData.id });
  if (!application) {
    throw createHttpError(404, "Application not found");
  }
  if (updateData.status === undefined) {
    throw new Error("Status must be defined");
  }
  application.status = updateData.status;
  await application.save();
  return application;
};

export const updateApplication = async (
  userId: string,
  updateData: Partial<IApplication>,
  id: string
) => {
  const application = await Application.findOne({ _id: id });
  if (!application) {
    throw createHttpError(404, "Application not found");
  }
  Object.assign(application, updateData);
  await application.save();
  return application;
};

export const getAllApplicationsForUser = async (userId: string) => {
  const applications = await Application.find({ userId });
  return applications;
};

export const getApplicationById = async (userId: string, id: string) => {
  const application = await Application.findOne({ _id: id });
  return application;
};

export const deleteApplication = async (userId: string, id: string) => {
  const application = await Application.findOneAndDelete({  _id: id });
  if (!application) {
    throw createHttpError(404, "Application not found");
  }
  return application;
};

export const deleteApplicationByAdmin = async (id: string) => {
  const application = await Application.findOneAndDelete({ _id: id });
  if (!application) {
    throw createHttpError(404, "Application not found");
  }
  return application;
};

export const getAllApplications = async () => {
  // Use lean to work with plain objects and reliably add fields
  const applications: any[] = await Application.find()
    .populate('userId', 'name email phone')
    .lean();
  const userIds = applications.map((a: any) => a.userId?._id).filter(Boolean);
  const profiles = await Profile.find({ userId: { $in: userIds } }, 'userId pancardNumber phone').lean();
  const userIdToProfile: Record<string, { pancardNumber?: string; phone?: string }> = {};
  for (const p of profiles) {
    userIdToProfile[String(p.userId)] = { pancardNumber: (p as any).pancardNumber, phone: (p as any).phone };
  }
  // Merge pancardNumber into populated user object for frontend convenience
  applications.forEach((app: any) => {
    const uid = app.userId?._id ? String(app.userId._id) : undefined;
    if (uid && userIdToProfile[uid]) {
      (app.userId as any) = {
        ...(app.userId as any),
        pancardNumber: userIdToProfile[uid].pancardNumber,
        phone: userIdToProfile[uid].phone ?? (app.userId as any).phone,
      };
    }
  });
  return applications;
};
export const uploadPanImage = async (file: Express.Multer.File, userId: string, id: string) => {
  if (!file) throw new Error("No file provided for upload");

  const userFolder = `users/${userId}/`;

  try {
    const application = await Application.findById(id);
    if (!application) throw createHttpError(404, "Application not found");

    const result: string = await uploadImage(file, userFolder);
    application.panImage = result;
    await application.save();
    return { url: result };

  } catch (error) {
    console.error("Error uploading image:", error);
    throw new Error('Failed to upload image');
  }
}

export const uploadRc = async (file: Express.Multer.File, userId: string, id: string) => {
  if (!file) throw new Error("No file provided for upload");

  const userFolder = `users/${userId}/`;

  try {
    const application = await Application.findById(id);
    if (!application) throw createHttpError(404, "Application not found");

    const result: string = await uploadImage(file, userFolder);
    application.rcImage = result;
    await application.save();
    return { url: result };

  } catch (error) {
    console.error("Error uploading image:", error);
    throw new Error('Failed to upload image');
  }
}


export const uploadVehicleFront = async (file: Express.Multer.File, userId: string, id: string) => {
  if (!file) throw new Error("No file provided for upload");

  const userFolder = `users/${userId}/`;

  try {
    const application = await Application.findById(id);
    if (!application) throw createHttpError(404, "Application not found");

    const result: string = await uploadImage(file, userFolder);
    application.vehicleFrontImage = result;
    await application.save();
    return { url: result };

  } catch (error) {
    console.error("Error uploading image:", error);
    throw new Error('Failed to upload image');
  }
}

export const uploadVehicleSideImage = async (file: Express.Multer.File, userId: string, id: string) => {
  if (!file) throw new Error("No file provided for upload");

  const userFolder = `users/${userId}/`;

  try {
    const application = await Application.findById(id);
    if (!application) throw createHttpError(404, "Application not found");

    const result: string = await uploadImage(file, userFolder);
    application.vehicleSideImage = result;
    await application.save();
    return { url: result };

  } catch (error) {
    console.error("Error uploading image:", error);
    throw new Error('Failed to upload image');
  }
}
