"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const applicationController = __importStar(require("./application.controllers"));
const applicationValidation = __importStar(require("./application.validations"));
const catch_error_1 = require("../common/middleware/catch-error");
const role_auth_middleware_1 = require("../common/middleware/role-auth.middleware");
const multer_1 = __importDefault(require("multer"));
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)();
router
    .post("/create", (0, role_auth_middleware_1.roleAuth)(["USER", "ADMIN"]), applicationValidation.createApplicationValidation, catch_error_1.catchError, applicationController.createApplication)
    .put("/update/:id", (0, role_auth_middleware_1.roleAuth)(["USER", "ADMIN"]), applicationValidation.idParamValidation, applicationValidation.updateApplicationValidation, catch_error_1.catchError, applicationController.updateApplication)
    .get("/", (0, role_auth_middleware_1.roleAuth)(["ADMIN"]), applicationController.getAllApplications)
    .get("/my-application", (0, role_auth_middleware_1.roleAuth)(["USER"]), applicationController.getAllApplicationsForUser)
    .put("/update-status", (0, role_auth_middleware_1.roleAuth)(["ADMIN"]), applicationValidation.updateStatusValidation, catch_error_1.catchError, applicationController.updateStatus)
    .post("/upload-rc/:id", (0, role_auth_middleware_1.roleAuth)(["USER",]), applicationValidation.idParamValidation, catch_error_1.catchError, upload.single("file"), applicationController.uploadRc)
    .post("/upload-vehicle-front/:id", (0, role_auth_middleware_1.roleAuth)(["USER"]), applicationValidation.idParamValidation, catch_error_1.catchError, upload.single("file"), applicationController.uploadVehicleFront)
    .post("/upload-vehicle-side/:id", (0, role_auth_middleware_1.roleAuth)(["USER"]), applicationValidation.idParamValidation, catch_error_1.catchError, upload.single("file"), applicationController.uploadVehicleSideImage)
    .post("/upload-pan/:id", (0, role_auth_middleware_1.roleAuth)(["USER"]), applicationValidation.idParamValidation, catch_error_1.catchError, upload.single("file"), applicationController.uploadPanImage)
    .delete("/:id", (0, role_auth_middleware_1.roleAuth)(["ADMIN"]), applicationValidation.idParamValidation, catch_error_1.catchError, applicationController.deleteApplication)
    .get("/:id", (0, role_auth_middleware_1.roleAuth)(["USER", "ADMIN"]), applicationValidation.idParamValidation, catch_error_1.catchError, applicationController.getApplicationById);
exports.default = router;
