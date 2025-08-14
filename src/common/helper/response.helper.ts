interface IResponse {
    success: boolean;
    message?: string | undefined;
    data: object | null | any;
  }
  
  export type ErrorResponse = IResponse & {
    error_code: number;
  };
  
  export const createResponse = (
    data: IResponse["data"],
    message?: string
  ): IResponse => {
    return { data, message, success: true };
  };
  