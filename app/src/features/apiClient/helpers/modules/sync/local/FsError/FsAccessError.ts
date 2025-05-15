import { BaseError } from "./BaseError";
import { ErrorCode, ErrorMetaData } from "./types";

export class FsAccessError extends BaseError {
  static from(message: string, meta?: ErrorMetaData) {
    return new FsAccessError(ErrorCode.PERMISSION_DENIED, message, meta);
  }
}
