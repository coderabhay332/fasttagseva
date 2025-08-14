import { type IUser } from "./user.dto";
export declare const generateRefreshToken: (id: string, role: string) => string;
export declare const createUser: (data: IUser) => Promise<any>;
export declare const updateUser: (id: string, data: IUser) => Promise<any>;
export declare const me: (user: IUser) => Promise<any>;
export declare const editUser: (id: string, data: Partial<IUser>) => Promise<any>;
export declare const deleteUser: (id: string) => Promise<any>;
export declare const getUserById: (id: string) => Promise<any>;
export declare const getAllUser: () => Promise<any>;
export declare const login: (email: string, password: string) => Promise<any>;
export declare const getUserByEmail: (email: string, withPassword?: boolean) => Promise<any>;
export declare const updateUserToken: (user: IUser, refreshToken: string) => Promise<any>;
export declare const refreshToken: (user: IUser, refreshToken: string) => Promise<{
    accessToken: any;
    refreshToken: any;
    user: {
        _id: any;
        email: any;
        name: any;
    };
}>;
//# sourceMappingURL=user.service.d.ts.map