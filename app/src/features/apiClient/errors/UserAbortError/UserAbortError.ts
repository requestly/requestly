import { NativeError } from "errors/NativeError";

export class UserAbortError extends NativeError {
  constructor() {
    super("Request execution Aborted");
    this.name = "UserAbortError";
  }
}
