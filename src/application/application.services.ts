import e from "cors";
import { Application } from "./application.schema";

interface IApplication {
  vehicle: string;
  chesisNumber: string;
  status?: "NOT SUBMITTED" | "PENDING" | "AGENT ASSIGNED" | "REJECTED" | "DONE";
}

export const createApplication = async (userId: string, applicationData: IApplication) => {

    const application = new Application({ ...applicationData, user: userId });
    application.status = "PENDING";
    await application.save();

    return application;
};


export const updateStatus = async (
  userId: string,
  updateData: { status: IApplication["status"] }
) => {
  const application = await Application.findOne({ user: userId });
  if (!application) {
    throw new Error("Application not found");
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
  const application = await Application.findOne({ user: userId, _id: id });
  if (!application) {
    throw new Error("Application not found");
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
  const application = await Application.findOne({ userId, _id: id });
  return application;
};

export const deleteApplication = async (userId: string, id: string) => {
  const application = await Application.findOneAndDelete({ userId, _id: id });
  return application;
};

export const getAllApplications = async () => {
  const applications = await Application.find();
  return applications;
};