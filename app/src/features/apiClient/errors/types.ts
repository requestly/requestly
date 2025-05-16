import { NativeError } from "./NativeError";

export type Constructable = { from: (...args: any) => NativeError };

export type ErrorCodeMap = { [key: string]: Constructable };

export enum ErrorCode {
  WRONG_INPUT = "wrong_input",
  PERMISSION_DENIED = "permission_denied",
  UNKNOWN = "unknown",
}

export type ErrorMetaData = Record<string, any>;
