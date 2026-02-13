import { ErrorCode, ErrorSeverity } from "./types";

export class NativeError extends Error {
  public errorCode: ErrorCode = ErrorCode.UNKNOWN;
  public severity: ErrorSeverity = ErrorSeverity.ERROR;
  private _context: Record<string, any> = {};
  public showBoundary: boolean = false;

  constructor(message: string) {
    super(message);
    // To properly add type of error in Sentry
    this.name = this.constructor.name;
  }

  addContext(ctx: Record<string, any>) {
    this._context = Object.assign(this._context, ctx);
    return this;
  }

  setSeverity(severity: ErrorSeverity) {
    this.severity = severity;
    return this;
  }

  setShowBoundary(showBoundary: boolean) {
    this.showBoundary = showBoundary;
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
