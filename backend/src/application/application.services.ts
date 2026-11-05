import { Application, SERVICE_TYPES } from "./application.schema";
import {uploadImage} from "../common/services/cloudinary.services";
import createHttpError from "http-errors";
import { Profile } from "../profile/profile.schema";
interface IApplication {
  serviceType?: (typeof SERVICE_TYPES)[number];
  vehicle: string;
  chasisNumber?: string;
  engineNumber?: string;
  notes?: string;
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
  return uploadApplicationImage(file, userId, id, "panImage");
}

export const uploadRc = async (file: Express.Multer.File, userId: string, id: string) => {
  return uploadApplicationImage(file, userId, id, "rcImage");
}


export const uploadVehicleFront = async (file: Express.Multer.File, userId: string, id: string) => {
  return uploadApplicationImage(file, userId, id, "vehicleFrontImage");
}

export const uploadVehicleSideImage = async (file: Express.Multer.File, userId: string, id: string) => {
  return uploadApplicationImage(file, userId, id, "vehicleSideImage");
}

// Shared upload path for all application document images. Centralising this
// keeps error handling consistent and avoids losing real HTTP statuses:
//   - a missing file is a 400 (client error), not a generic 500
//   - a missing/non-owned application stays a 404 (it is NOT swallowed and
//     re-thrown as 500 the way the old per-field try/catch blocks did)
//   - a genuine Cloudinary failure becomes a 502 (upstream dependency), with the
//     real cause logged server-side rather than hidden behind "Failed to upload"
type ApplicationImageField =
  | "panImage"
  | "rcImage"
  | "vehicleFrontImage"
  | "vehicleSideImage";

const uploadApplicationImage = async (
  file: Express.Multer.File,
  userId: string,
  id: string,
  field: ApplicationImageField
) => {
  if (!file) throw createHttpError(400, "No file provided for upload");

  // A missing application is a real 404 and must surface as one. It is checked
  // OUTSIDE the Cloudinary try/catch so it can never be re-wrapped as a 500.
  const application = await Application.findOne({ _id: id, userId });
  if (!application) throw createHttpError(404, "Application not found");

  let url: string;
  try {
    url = await uploadImage(file, `users/${userId}/`);
  } catch (error) {
    // Log the real Cloudinary error for diagnosis, but report a 502 so the
    // client knows the failure is an upstream dependency, not their request.
    console.error(`Cloudinary upload failed for ${field}:`, error);
    throw createHttpError(502, "Image upload failed. Please try again.");
  }

  application[field] = url;
  await application.save();
  return { url };
}
