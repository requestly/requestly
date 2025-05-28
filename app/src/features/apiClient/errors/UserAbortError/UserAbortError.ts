import { NativeError } from "errors/NativeError";

export class UserAbortError extends NativeError {
  constructor() {
    super("Request cancelled");
    this.name = "UserAbortError";
  }
}
