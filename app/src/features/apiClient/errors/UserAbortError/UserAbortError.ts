export class UserAbortError extends Error {
  constructor() {
    super("Request execution Aborted");
    this.name = "UserAbortError";
  }
}
