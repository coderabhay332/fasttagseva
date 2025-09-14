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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadVehicleFrontImage = exports.uploadVehicleSideImage = exports.uploadVehicleFront = exports.uploadPanImage = exports.uploadRc = exports.getAllApplications = exports.deleteApplication = exports.getApplicationById = exports.getAllApplicationsForUser = exports.updateApplication = exports.updateStatus = exports.createApplication = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const http_errors_1 = __importDefault(require("http-errors"));
const response_helper_1 = require("../common/helper/response.helper");
const applicationService = __importStar(require("./application.services"));
exports.createApplication = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
    if (!userId) {
        throw (0, http_errors_1.default)(401, "Unauthorized");
    }
    const result = yield applicationService.createApplication(userId, req.body);
    res.send((0, response_helper_1.createResponse)(result, "Application created successfully"));
}));
exports.updateStatus = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield applicationService.updateStatus(req.body);
    res.send((0, response_helper_1.createResponse)(result, "Application status updated successfully"));
}));
exports.updateApplication = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b._id;
    const id = req.params.id;
    console.log(userId, id);
    if (!userId) {
        throw (0, http_errors_1.default)(401, "Unauthorized");
    }
    const result = yield applicationService.updateApplication(userId, req.body, id);
    res.send((0, response_helper_1.createResponse)(result, "Application updated successfully"));
}));
exports.getAllApplicationsForUser = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    const userId = (_c = req.user) === null || _c === void 0 ? void 0 : _c._id;
    if (!userId) {
        throw (0, http_errors_1.default)(401, "Unauthorized");
    }
    const result = yield applicationService.getAllApplicationsForUser(userId);
    res.send((0, response_helper_1.createResponse)(result, "Applications retrieved successfully"));
}));
exports.getApplicationById = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _d;
    const userId = (_d = req.user) === null || _d === void 0 ? void 0 : _d._id;
    const id = req.params.id;
    if (!userId) {
        throw (0, http_errors_1.default)(401, "Unauthorized");
    }
    const result = yield applicationService.getApplicationById(userId, id);
    if (!result) {
        throw (0, http_errors_1.default)(404, "Application not found");
    }
    res.send((0, response_helper_1.createResponse)(result, "Application retrieved successfully"));
}));
exports.deleteApplication = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _e, _f;
    const userId = (_e = req.user) === null || _e === void 0 ? void 0 : _e._id;
    const userRole = (_f = req.user) === null || _f === void 0 ? void 0 : _f.role;
    const id = req.params.id;
    if (!userId) {
        throw (0, http_errors_1.default)(401, "Unauthorized");
    }
    // If user is ADMIN, they can delete any application
    // If user is USER, they can only delete their own applications
    if (userRole === 'ADMIN') {
        const result = yield applicationService.deleteApplicationByAdmin(id);
        res.send((0, response_helper_1.createResponse)(result, "Application deleted successfully by admin"));
    }
    else {
        const result = yield applicationService.deleteApplication(userId, id);
        res.send((0, response_helper_1.createResponse)(result, "Application deleted successfully"));
    }
}));
exports.getAllApplications = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Admin can see all applications, no need to check userId
    const result = yield applicationService.getAllApplications();
    res.send((0, response_helper_1.createResponse)(result, "Applications retrieved successfully"));
}));
exports.uploadRc = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.file) {
        res.status(400).send((0, response_helper_1.createResponse)(null, "No file uploaded"));
        return;
    }
    if (!req.user) {
        throw (0, http_errors_1.default)(401, "Unauthorized");
    }
    const id = req.params.id;
    const result = yield applicationService.uploadRc(req.file, req.user._id, id);
    res.send((0, response_helper_1.createResponse)(result, "RC uploaded successfully"));
}));
exports.uploadPanImage = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(req.file);
    if (!req.file) {
        res.status(400).send((0, response_helper_1.createResponse)(null, "No file uploaded"));
        return;
    }
    if (!req.user) {
        throw (0, http_errors_1.default)(401, "Unauthorized");
    }
    const id = req.params.id;
    const result = yield applicationService.uploadPanImage(req.file, req.user._id, id);
    res.send((0, response_helper_1.createResponse)(result, "PAN image uploaded successfully"));
}));
exports.uploadVehicleFront = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.file) {
        res.status(400).send((0, response_helper_1.createResponse)(null, "No file uploaded"));
        return;
    }
    if (!req.user) {
        throw (0, http_errors_1.default)(401, "Unauthorized");
    }
    const id = req.params.id;
    const result = yield applicationService.uploadVehicleFront(req.file, req.user._id, id);
    res.send((0, response_helper_1.createResponse)(result, "Vehicle front image uploaded successfully"));
}));
exports.uploadVehicleSideImage = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.file) {
        res.status(400).send((0, response_helper_1.createResponse)(null, "No file uploaded"));
        return;
    }
    if (!req.user) {
        throw (0, http_errors_1.default)(401, "Unauthorized");
    }
    const id = req.params.id;
    const result = yield applicationService.uploadVehicleSideImage(req.file, req.user._id, id);
    res.send((0, response_helper_1.createResponse)(result, "Vehicle side image uploaded successfully"));
}));
exports.uploadVehicleFrontImage = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.file) {
        res.status(400).send((0, response_helper_1.createResponse)(null, "No file uploaded"));
        return;
    }
    if (!req.user) {
        throw (0, http_errors_1.default)(401, "Unauthorized");
    }
    const id = req.params.id;
    const result = yield applicationService.uploadVehicleFront(req.file, req.user._id, id);
    res.send((0, response_helper_1.createResponse)(result, "Vehicle front image uploaded successfully"));
}));
