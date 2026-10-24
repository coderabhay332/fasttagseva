import jwt, { JwtPayload } from "jsonwebtoken";
import { type NextFunction, type Request, type Response } from "express";


declare global {
  namespace Express {
    interface User extends IUser {}
    interface Request {
      user?: IUser;
    }
  }
}
import expressAsyncHandler from "express-async-handler";
import createHttpError from "http-errors";
import { type IUser } from "../../user/user.dto";


export const roleAuth = (roles: IUser["role"][], publicRoutes: string[] = []) =>
  expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      if (publicRoutes.includes(req.path)) {
        next();
        return;
      }
      const token =
        req.headers.authorization?.replace("Bearer ", "") ??
        req.cookies?.accessToken;
      if (!token) {
        throw createHttpError(401, {
          message: `Invalid token`,
        });
      }

      // Access tokens are signed with JWT_ACCESS_SECRET (see createUserTokens).
      // Verification MUST use the same secret, otherwise every protected route
      // rejects valid tokens whenever the two secrets differ.
      const accessSecret = process.env.JWT_ACCESS_SECRET ?? process.env.JWT_SECRET;
      if (!accessSecret) {
        throw createHttpError(500, {
          message: "Server misconfiguration: JWT access secret is not set",
        });
      }

      try {
        const decodedUser = jwt.verify(token, accessSecret) as JwtPayload;
        req.user = decodedUser as IUser;
      } catch (err) {
        throw createHttpError(401, {
          message: "Invalid token",
        });
      }

      const user = req.user as IUser;
      if (user.role == null || !["ADMIN", "USER"].includes(user.role)) {
        throw createHttpError(401, { message: "Invalid user role" });
      }
      if (!roles.includes(user.role)) {
        const type =
          user.role.slice(0, 1) + user.role.slice(1).toLocaleLowerCase();

        throw createHttpError(401, {
          message: `${type} can not access this resource`,
        });
      }
      next();
    }
  );
