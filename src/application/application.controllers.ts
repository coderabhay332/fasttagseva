import {  Request, Response } from "express";
import asyncHandler from "express-async-handler";
import createHttpError from "http-errors";
import { createResponse } from "../common/helper/response.helper";

import * as applicationService from "./application.services";
import e from "cors";

export const createApplication = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id;
  if (!userId) {
    throw createHttpError(401, "Unauthorized");
  }
  const result = await applicationService.createApplication(userId, req.body);
  res.send(createResponse(result, "Application created successfully"));
});


export const updateStatus = asyncHandler(async (req: Request, res: Response) => {
    const result = await applicationService.updateStatus(req.body);
    res.send(createResponse(result, "Application status updated successfully"));
});

export const updateApplication = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id;
  const id = req.params.id;
  console.log(userId, id);
  if (!userId) {
    throw createHttpError(401, "Unauthorized");
  }
  const result = await applicationService.updateApplication(userId, req.body, id);
  res.send(createResponse(result, "Application updated successfully"));
});

export const getAllApplicationsForUser = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id;
  if (!userId) {
    throw createHttpError(401, "Unauthorized");
  }
  const result = await applicationService.getAllApplicationsForUser(userId);
  res.send(createResponse(result, "Applications retrieved successfully"));
});

export const getApplicationById = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id;
  const id = req.params.id;
  if (!userId) {
    throw createHttpError(401, "Unauthorized");
  }
  const result = await applicationService.getApplicationById(userId, id);
  if (!result) {
    throw createHttpError(404, "Application not found");
  }
  res.send(createResponse(result, "Application retrieved successfully"));
});

export const deleteApplication = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id;
  const userRole = req.user?.role;
  const id = req.params.id;
  
  if (!userId) {
    throw createHttpError(401, "Unauthorized");
  }

  // If user is ADMIN, they can delete any application
  // If user is USER, they can only delete their own applications
  if (userRole === 'ADMIN') {
    const result = await applicationService.deleteApplicationByAdmin(id);
    res.send(createResponse(result, "Application deleted successfully by admin"));
  } else {
    const result = await applicationService.deleteApplication(userId, id);
    res.send(createResponse(result, "Application deleted successfully"));
  }
});

export const getAllApplications = asyncHandler(async (req: Request, res: Response) => {
  // Admin can see all applications, no need to check userId
  const result = await applicationService.getAllApplications();
  res.send(createResponse(result, "Applications retrieved successfully"));
});

export const uploadRc = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
      res.status(400).send(createResponse(null, "No file uploaded"));
      return;
  }
  if(!req.user) {
     throw createHttpError(401, "Unauthorized");
  }
  const id = req.params.id;

  const result = await applicationService.uploadRc(req.file, req.user._id as string, id);
  res.send(createResponse(result, "RC uploaded successfully"));
});

export const uploadPanImage = asyncHandler(async (req: Request, res: Response) => {
  console.log(req.file);
  if (!req.file) {
      res.status(400).send(createResponse(null, "No file uploaded"));
      return;
  }
  if(!req.user) {
     throw createHttpError(401, "Unauthorized");
  }
  const id = req.params.id;

  const result = await applicationService.uploadPanImage(req.file, req.user._id as string, id);
  res.send(createResponse(result, "PAN image uploaded successfully"));
});

export const uploadVehicleFront = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
      res.status(400).send(createResponse(null, "No file uploaded"));
      return;
  }
  if(!req.user) {
     throw createHttpError(401, "Unauthorized");
  }
  const id = req.params.id; 

  const result = await applicationService.uploadVehicleFront(req.file, req.user._id as string, id);
  res.send(createResponse(result, "Vehicle front image uploaded successfully"));
});

export const uploadVehicleSideImage = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
      res.status(400).send(createResponse(null, "No file uploaded"));
      return;
  }
  if(!req.user) {
     throw createHttpError(401, "Unauthorized");
  }
  const id = req.params.id;

  const result = await applicationService.uploadVehicleSideImage(req.file, req.user._id as string, id);
  res.send(createResponse(result, "Vehicle side image uploaded successfully"));
});

export const uploadVehicleFrontImage = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
      res.status(400).send(createResponse(null, "No file uploaded"));
      return;
  }
  if(!req.user) {
     throw createHttpError(401, "Unauthorized");
  }
  const id = req.params.id;

  const result = await applicationService.uploadVehicleFront(req.file, req.user._id as string, id);
  res.send(createResponse(result, "Vehicle front image uploaded successfully"));
});
