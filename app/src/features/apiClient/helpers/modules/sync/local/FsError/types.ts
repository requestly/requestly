import { BaseError } from "./BaseError";

export type Constructable = { from: (...args: any) => BaseError };

export type ErrorCodeMap = { [key: string]: Constructable };

export enum ErrorCode {
  WRONG_INPUT = "wrong_input",
  PERMISSION_DENIED = "permission_denied",
  UNKNOWN = "unknown",
}

export type ErrorMetaData = Record<string, any>;
