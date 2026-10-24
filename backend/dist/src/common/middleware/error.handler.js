"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errorHandler = (err, req, res, next) => {
    var _a, _b, _c;
    const response = {
        success: false,
        error_code: ((_a = err === null || err === void 0 ? void 0 : err.status) !== null && _a !== void 0 ? _a : 500),
        message: ((_b = err === null || err === void 0 ? void 0 : err.message) !== null && _b !== void 0 ? _b : "Something went wrong!"),
        data: (_c = err === null || err === void 0 ? void 0 : err.data) !== null && _c !== void 0 ? _c : {},
    };
    // Do NOT call next() after sending — once a response is sent, forwarding to
    // the default Express handler throws ERR_HTTP_HEADERS_SENT.
    res.status(response.error_code).send(response);
};
exports.default = errorHandler;
