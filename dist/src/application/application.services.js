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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApplication = void 0;
const application_schema_1 = require("./application.schema");
const createApplication = (userId, applicationData) => __awaiter(void 0, void 0, void 0, function* () {
    const application = new application_schema_1.Application(Object.assign(Object.assign({}, applicationData), { user: userId }));
    application.status = "PENDING";
    yield application.save();
    return application;
});
exports.createApplication = createApplication;
