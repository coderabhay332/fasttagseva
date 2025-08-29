"use strict";
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
exports.uploadVehicleSideImage = exports.uploadVehicleFront = exports.uploadRc = exports.uploadPanImage = exports.getAllApplications = exports.deleteApplicationByAdmin = exports.deleteApplication = exports.getApplicationById = exports.getAllApplicationsForUser = exports.updateApplication = exports.updateStatus = exports.createApplication = void 0;
const application_schema_1 = require("./application.schema");
const cloudinary_services_1 = require("../common/services/cloudinary.services");
const http_errors_1 = __importDefault(require("http-errors"));
const profile_schema_1 = require("../profile/profile.schema");
const createApplication = (userId, applicationData) => __awaiter(void 0, void 0, void 0, function* () {
    const application = new application_schema_1.Application(Object.assign(Object.assign({}, applicationData), { userId }));
    application.status = "PENDING";
    yield application.save();
    return application;
});
exports.createApplication = createApplication;
const updateStatus = (updateData) => __awaiter(void 0, void 0, void 0, function* () {
    const application = yield application_schema_1.Application.findOne({ _id: updateData.id });
    if (!application) {
        throw (0, http_errors_1.default)(404, "Application not found");
    }
    if (updateData.status === undefined) {
        throw new Error("Status must be defined");
    }
    application.status = updateData.status;
    yield application.save();
    return application;
});
exports.updateStatus = updateStatus;
const updateApplication = (userId, updateData, id) => __awaiter(void 0, void 0, void 0, function* () {
    const application = yield application_schema_1.Application.findOne({ _id: id });
    if (!application) {
        throw (0, http_errors_1.default)(404, "Application not found");
    }
    Object.assign(application, updateData);
    yield application.save();
    return application;
});
exports.updateApplication = updateApplication;
const getAllApplicationsForUser = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const applications = yield application_schema_1.Application.find({ userId });
    return applications;
});
exports.getAllApplicationsForUser = getAllApplicationsForUser;
const getApplicationById = (userId, id) => __awaiter(void 0, void 0, void 0, function* () {
    const application = yield application_schema_1.Application.findOne({ _id: id });
    return application;
});
exports.getApplicationById = getApplicationById;
const deleteApplication = (userId, id) => __awaiter(void 0, void 0, void 0, function* () {
    const application = yield application_schema_1.Application.findOneAndDelete({ _id: id });
    if (!application) {
        throw (0, http_errors_1.default)(404, "Application not found");
    }
    return application;
});
exports.deleteApplication = deleteApplication;
const deleteApplicationByAdmin = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const application = yield application_schema_1.Application.findOneAndDelete({ _id: id });
    if (!application) {
        throw (0, http_errors_1.default)(404, "Application not found");
    }
    return application;
});
exports.deleteApplicationByAdmin = deleteApplicationByAdmin;
const getAllApplications = () => __awaiter(void 0, void 0, void 0, function* () {
    // Use lean to work with plain objects and reliably add fields
    const applications = yield application_schema_1.Application.find()
        .populate('userId', 'name email phone')
        .lean();
    const userIds = applications.map((a) => { var _a; return (_a = a.userId) === null || _a === void 0 ? void 0 : _a._id; }).filter(Boolean);
    const profiles = yield profile_schema_1.Profile.find({ userId: { $in: userIds } }, 'userId pancardNumber phone').lean();
    const userIdToProfile = {};
    for (const p of profiles) {
        userIdToProfile[String(p.userId)] = { pancardNumber: p.pancardNumber, phone: p.phone };
    }
    // Merge pancardNumber into populated user object for frontend convenience
    applications.forEach((app) => {
        var _a, _b;
        const uid = ((_a = app.userId) === null || _a === void 0 ? void 0 : _a._id) ? String(app.userId._id) : undefined;
        if (uid && userIdToProfile[uid]) {
            app.userId = Object.assign(Object.assign({}, app.userId), { pancardNumber: userIdToProfile[uid].pancardNumber, phone: (_b = userIdToProfile[uid].phone) !== null && _b !== void 0 ? _b : app.userId.phone });
        }
    });
    return applications;
});
exports.getAllApplications = getAllApplications;
const uploadPanImage = (file, userId, id) => __awaiter(void 0, void 0, void 0, function* () {
    if (!file)
        throw new Error("No file provided for upload");
    const userFolder = `users/${userId}/`;
    try {
        const application = yield application_schema_1.Application.findById(id);
        if (!application)
            throw (0, http_errors_1.default)(404, "Application not found");
        const result = yield (0, cloudinary_services_1.uploadImage)(file, userFolder);
        application.panImage = result;
        yield application.save();
        return { url: result };
    }
    catch (error) {
        console.error("Error uploading image:", error);
        throw new Error('Failed to upload image');
    }
});
exports.uploadPanImage = uploadPanImage;
const uploadRc = (file, userId, id) => __awaiter(void 0, void 0, void 0, function* () {
    if (!file)
        throw new Error("No file provided for upload");
    const userFolder = `users/${userId}/`;
    try {
        const application = yield application_schema_1.Application.findById(id);
        if (!application)
            throw (0, http_errors_1.default)(404, "Application not found");
        const result = yield (0, cloudinary_services_1.uploadImage)(file, userFolder);
        application.rcImage = result;
        yield application.save();
        return { url: result };
    }
    catch (error) {
        console.error("Error uploading image:", error);
        throw new Error('Failed to upload image');
    }
});
exports.uploadRc = uploadRc;
const uploadVehicleFront = (file, userId, id) => __awaiter(void 0, void 0, void 0, function* () {
    if (!file)
        throw new Error("No file provided for upload");
    const userFolder = `users/${userId}/`;
    try {
        const application = yield application_schema_1.Application.findById(id);
        if (!application)
            throw (0, http_errors_1.default)(404, "Application not found");
        const result = yield (0, cloudinary_services_1.uploadImage)(file, userFolder);
        application.vehicleFrontImage = result;
        yield application.save();
        return { url: result };
    }
    catch (error) {
        console.error("Error uploading image:", error);
        throw new Error('Failed to upload image');
    }
});
exports.uploadVehicleFront = uploadVehicleFront;
const uploadVehicleSideImage = (file, userId, id) => __awaiter(void 0, void 0, void 0, function* () {
    if (!file)
        throw new Error("No file provided for upload");
    const userFolder = `users/${userId}/`;
    try {
        const application = yield application_schema_1.Application.findById(id);
        if (!application)
            throw (0, http_errors_1.default)(404, "Application not found");
        const result = yield (0, cloudinary_services_1.uploadImage)(file, userFolder);
        application.vehicleSideImage = result;
        yield application.save();
        return { url: result };
    }
    catch (error) {
        console.error("Error uploading image:", error);
        throw new Error('Failed to upload image');
    }
});
exports.uploadVehicleSideImage = uploadVehicleSideImage;
