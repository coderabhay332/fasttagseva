import {} from "express";
import {} from "../helper/response.helper";
const errorHandler = (err, req, res, next) => {
    const response = {
        success: false,
        error_code: (err?.status ?? 500),
        message: (err?.message ?? "Something went wrong!"),
        data: err?.data ?? {},
    };
    res.status(response.error_code).send(response);
    next();
};
export default errorHandler;
//# sourceMappingURL=error.handler.js.map