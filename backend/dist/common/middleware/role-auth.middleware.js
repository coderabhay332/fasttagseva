import jwt, { JwtPayload } from "jsonwebtoken";
import {} from "express";
import expressAsyncHandler from "express-async-handler";
import createHttpError from "http-errors";
import {} from "../../user/user.dto";
export const roleAuth = (roles, publicRoutes = []) => expressAsyncHandler(async (req, res, next) => {
    if (publicRoutes.includes(req.path)) {
        next();
        return;
    }
    const token = req.headers.authorization?.replace("Bearer ", "") ??
        req.cookies.accessToken;
    if (!token) {
        throw createHttpError(401, {
            message: `Invalid token`,
        });
    }
    try {
        const decodedUser = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decodedUser;
    }
    catch (err) {
        throw createHttpError(401, {
            message: "Invalid token",
        });
    }
    const user = req.user;
    if (user.role == null || !["ADMIN", "USER"].includes(user.role)) {
        throw createHttpError(401, { message: "Invalid user role" });
    }
    if (!roles.includes(user.role)) {
        const type = user.role.slice(0, 1) + user.role.slice(1).toLocaleLowerCase();
        throw createHttpError(401, {
            message: `${type} can not access this resource`,
        });
    }
    next();
});
//# sourceMappingURL=role-auth.middleware.js.map