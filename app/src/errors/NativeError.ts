import { ErrorCode, ErrorSeverity } from "./types";

export class NativeError<T extends Record<string, any> = Record<string, any>> extends Error {
  public errorCode: ErrorCode = ErrorCode.UNKNOWN;
  public severity: ErrorSeverity = ErrorSeverity.DEBUG;
  private _context: Partial<T> = {};

  constructor(message: string) {
    super(message);
    // To properly add type of error in Sentry
    this.name = this.constructor.name;
  }

  addContext(ctx: Partial<T>) {
    this._context = Object.assign(this._context, ctx);
    return this;
  }

  setSeverity(severity: ErrorSeverity) {
    this.severity = severity;
    return this;
  }

  set<T extends keyof this>(key: T, value: this[T]) {
    this[key] = value;
    return this;
  }

  get context() {
    return this._context;
  }

  static fromError(error: Error): NativeError {
    const nativeErr = new NativeError(error.message);
    nativeErr.name = error.name || "NativeError";
    nativeErr.stack = error.stack;
    return nativeErr;
  }
}
