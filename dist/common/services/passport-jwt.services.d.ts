import { type IUser } from "../../user/user.dto";
export declare const initPassport: () => void;
export declare const createUserTokens: (user: IUser) => {
    accessToken: string;
    refreshToken: string;
};
export declare const decodeToken: (token: string) => IUser;
//# sourceMappingURL=passport-jwt.services.d.ts.map