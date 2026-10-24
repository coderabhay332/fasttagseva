import { Application } from "./application.schema";
import {uploadImage} from "../common/services/cloudinary.services";
import createHttpError from "http-errors";
import { Profile } from "../profile/profile.schema";
interface IApplication {
  vehicle: string;
  chasisNumber: string;
  engineNumber: string;
  status?: "NOT SUBMITTED" | "PENDING" | "AGENT ASSIGNED" | "REJECTED" | "DONE";
}

type Role = "USER" | "ADMIN";

// Build a query filter that enforces ownership for non-admin users.
// ADMIN can access any application; a USER is restricted to their own.
const ownershipFilter = (id: string, userId: string, role?: Role) =>
  role === "ADMIN" ? { _id: id } : { _id: id, userId };

export const createApplication = async (userId: string, applicationData: IApplication) => {

    const application = new Application({ ...applicationData, userId });
    application.status = "PENDING";
    await application.save();

    return application;
};


const APPLICATION_STATUSES = [
  "NOT SUBMITTED",
  "PENDING",
  "AGENT ASSIGNED",
  "REJECTED",
  "DONE",
] as const;

export const updateStatus = async (
  updateData: { id: string, status: IApplication["status"] }
) => {
  if (!updateData.status || !APPLICATION_STATUSES.includes(updateData.status as any)) {
    throw createHttpError(400, "Invalid or missing application status");
  }
  const application = await Application.findOne({ _id: updateData.id });
  if (!application) {
    throw createHttpError(404, "Application not found");
  }
  application.status = updateData.status;
  await application.save();
  return application;
};

export const updateApplication = async (
  userId: string,
  updateData: Partial<IApplication>,
  id: string,
  role?: Role
) => {
  // Prevent clients from changing status or reassigning ownership via a
  // generic update. Status is managed only through the admin updateStatus flow.
  const safeUpdate = { ...updateData } as Partial<IApplication> & { userId?: unknown };
  delete (safeUpdate as any).status;
  delete (safeUpdate as any).userId;

  const application = await Application.findOne(ownershipFilter(id, userId, role));
  if (!application) {
    throw createHttpError(404, "Application not found");
  }
  Object.assign(application, safeUpdate);
  await application.save();
  return application;
};

export const getAllApplicationsForUser = async (userId: string) => {
  const applications = await Application.find({ userId });
  return applications;
};

export const getApplicationById = async (userId: string, id: string, role?: Role) => {
  const application = await Application.findOne(ownershipFilter(id, userId, role));
  return application;
};

export const deleteApplication = async (userId: string, id: string) => {
  const application = await Application.findOneAndDelete({ _id: id, userId });
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
    const application = await Application.findOne({ _id: id, userId });
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
    const application = await Application.findOne({ _id: id, userId });
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
    const application = await Application.findOne({ _id: id, userId });
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
    const application = await Application.findOne({ _id: id, userId });
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
