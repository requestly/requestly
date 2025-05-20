import { ErrorCode } from "./types";

export class NativeError<T extends Record<string, any> = Record<string, any>> extends Error {
  public errorCode: ErrorCode = ErrorCode.UNKNOWN;
  private context: Partial<T> = {};

  addContext(ctx: Partial<T>) {
    this.context = Object.assign(this.context, ctx);
    return this;
  }

  set<T extends keyof this>(key: T, value: this[T]) {
    this[key] = value;
    return this;
  }

  get details() {
    return this.context;
  }
}
