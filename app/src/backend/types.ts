type Response<T> = { success: true; data: T } | { success: false; data: null; message: string };

export type ResponsePromise<T> = Promise<Response<T>>;
