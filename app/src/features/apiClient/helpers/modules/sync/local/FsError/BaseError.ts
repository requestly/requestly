import { ErrorMetaData } from "./types";

export class BaseError extends Error {
  constructor(readonly code: string, readonly message: string, readonly meta?: ErrorMetaData) {
    super();
  }
}
