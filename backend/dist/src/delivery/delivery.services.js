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
exports.updateDelivery = exports.getDelivery = exports.createDelivery = void 0;
const delivery_schema_1 = require("./delivery.schema");
const createDelivery = (userId, orderId, deliveryAddress, trackingNumber) => __awaiter(void 0, void 0, void 0, function* () {
    const delivery = yield delivery_schema_1.DeliverySchema.create({ userId, orderId, deliveryAddress, trackingNumber });
    return delivery;
});
exports.createDelivery = createDelivery;
const getDelivery = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const delivery = yield delivery_schema_1.DeliverySchema.find({ userId });
    return delivery;
});
exports.getDelivery = getDelivery;
const updateDelivery = (userId, orderId, deliveryAddress, trackingNumber) => __awaiter(void 0, void 0, void 0, function* () {
    const delivery = yield delivery_schema_1.DeliverySchema.findOneAndUpdate({ userId, orderId }, { deliveryAddress, trackingNumber });
    return delivery;
});
exports.updateDelivery = updateDelivery;
