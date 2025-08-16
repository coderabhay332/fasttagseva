import { Request, Response } from "express";
import { createResponse } from "../common/helper/response.helper";

import * as createApplicationService from "./application.services";
import e from "cors";
export const createApplication = async (req: Request, res: Response) => {
  const userId = req.user?._id;
  if (!userId) {
    res.send(createResponse(null, "Unauthorized"));
    return;
  }
  const result = await createApplicationService.createApplication(userId, req.body);
  res.send(createResponse(result, "Application created successfully"));
  return;
};


export const updateStatus = async (req: Request, res: Response) => {
  const userId = req.user?._id;
  if (!userId) {
    res.send(createResponse(null, "Unauthorized"));
    return;
  }
  const result = await createApplicationService.updateStatus(userId, req.body);
  res.send(createResponse(result, "Application status updated successfully"));
  return;
};

export const updateApplication = async (req: Request, res: Response) => {
  const userId = req.user?._id;
  const id = req.params.id;
  if (!userId) {
    res.send(createResponse(null, "Unauthorized"));
    return;
  }
  const result = await createApplicationService.updateApplication(userId, req.body, id);
  res.send(createResponse(result, "Application updated successfully"));
  return;
};

export const getAllApplicationsForUser = async (req: Request, res: Response) => {
  const userId = req.user?._id;
  if (!userId) {
    res.send(createResponse(null, "Unauthorized"));
    return;
  }
  const result = await createApplicationService.getAllApplicationsForUser(userId);
  res.send(createResponse(result, "Applications retrieved successfully"));
  return;
};

export const getApplicationById = async (req: Request, res: Response) => {
  const userId = req.user?._id;
  const id = req.params.id;
  if (!userId) {
    res.send(createResponse(null, "Unauthorized"));
    return;
  }
  const result = await createApplicationService.getApplicationById(userId, id);
  res.send(createResponse(result, "Application retrieved successfully"));
  return;
};

export const deleteApplication = async (req: Request, res: Response) => {
  const userId = req.user?._id;
  const id = req.params.id;
  if (!userId) {
    res.send(createResponse(null, "Unauthorized"));
    return;
  }
  const result = await createApplicationService.deleteApplication(userId, id);
  res.send(createResponse(result, "Application deleted successfully"));
  return;
};

export const getAllApplications = async (req: Request, res: Response) => {
  const userId = req.user?._id;
  if (!userId) {
    res.send(createResponse(null, "Unauthorized"));
    return;
  }
  const result = await createApplicationService.getAllApplications();
  res.send(createResponse(result, "Applications retrieved successfully"));
  return;
};
