declare global {
    namespace Express {
        interface User extends IUser {
        }
        interface Request {
            user?: IUser;
        }
    }
}
import { type IUser } from "../../user/user.dto";
export declare const roleAuth: (roles: IUser["role"][], publicRoutes?: string[]) => import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
//# sourceMappingURL=role-auth.middleware.d.ts.map