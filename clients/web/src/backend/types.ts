type ErrorType = "NOT_FOUND" | "INTERNAL_SERVER_ERROR";

type ResponseError = {
  type: ErrorType;
  message?: string;
};

type Response<T> = { success: true; data: T } | { success: false; data: null; error: ResponseError };

export type ResponsePromise<T> = Promise<Response<T>>;
