interface IResponse {
    success: boolean;
    message?: string | undefined;
    data: object | null | any;
}
export type ErrorResponse = IResponse & {
    error_code: number;
};
export declare const createResponse: (data: IResponse["data"], message?: string) => IResponse;
export {};
//# sourceMappingURL=response.helper.d.ts.map