import { ErrorCode, ErrorSeverity } from "./types";

export class NativeError<T extends Record<string, any> = Record<string, any>> extends Error {
  public errorCode: ErrorCode = ErrorCode.UNKNOWN;
  public severity: ErrorSeverity = ErrorSeverity.DEBUG;
  private _context: Partial<T> = {};

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
}
