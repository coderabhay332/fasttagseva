import { Profile } from "./profile.schema";
import { createResponse } from "../common/helper/response.helper";
import { Request, Response } from "express";
import * as profileService from "./profile.services";
import asyncHandler from "express-async-handler";

// GET /api/profiles/me
export const getProfile = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  if (!userId) {
    console.log("No userId found in req.user");
    res.status(401).json(createResponse(null, "Unauthorized"));
    return;
  }

  const profile = await profileService.getProfile(userId);
  res.json(createResponse(profile, "Profile retrieved successfully"));
});

// PATCH or POST /api/profiles/update
export const updateProfile = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  if (!userId) {
    console.log("No userId found in req.user");
    res.status(401).json(createResponse(null, "Unauthorized"));
    return;
  }

  const { phone, pancardNumber, dateOfBirth } = req.body;

  const updatedProfile = await profileService.updateProfile(userId, {
    phone,
    pancardNumber,
    dateOfBirth
  });

  res.json(createResponse(updatedProfile, "Profile updated successfully"));
});


export const uploadImage = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
      res.status(400).send(createResponse(null, "No file uploaded"));
      return;
  }
  if(!req.user) {
     res.status(401).send(createResponse(null, "Unauthorized"));
     return;
  }

  const result = await profileService.uploadPanimage(req.file, req.user._id as string);
  res.send(createResponse(result, "Image uploaded successfully"));
});