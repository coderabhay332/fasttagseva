import { type ErrorRequestHandler } from "express";
import { type ErrorResponse } from "../helper/response.helper";

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  const response: ErrorResponse = {
    success: false,
    error_code: (err?.status ?? 500) as number,
    message: (err?.message ?? "Something went wrong!") as string,
    data: err?.data ?? {},
  };

  // Do NOT call next() after sending — once a response is sent, forwarding to
  // the default Express handler throws ERR_HTTP_HEADERS_SENT.
  res.status(response.error_code).send(response);
};

export default errorHandler;
