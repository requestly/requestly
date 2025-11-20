type RawResult<T, E extends Error = Error> =
  | {
      success: true;
      result: T;
    }
  | {
      success: false;
      error: E;
    };

export abstract class Result<T, E extends Error = Error> {
  constructor(readonly result: RawResult<T, E>) {}

  isOk(): this is Ok<T> {
    return this.result.success;
  }

  isOkAnd(fn: (arg: T) => boolean) {
    return !this.result.success ? false : fn(this.result.result);
  }

  isError(): this is Err<E> {
    return !this.isOk();
  }

  isErrorAnd(fn: (arg: E) => boolean) {
    return this.result.success ? false : fn(this.result.error);
  }

  map<K>(fn: (arg: T) => K) {
    if (!this.result.success) {
      return this;
    }

    return new Ok({
      success: true,
      result: fn(this.result.result),
    });
  }

  mapOr<K>(def: K, fn: (arg: T) => K) {
    if (!this.result.success) {
      return def;
    }

    return fn(this.result.result);
  }

  mapOrElse<U>(def: (arg: E) => U, fn: (arg: T) => U) {
    if (!this.result.success) {
      return def(this.result.error);
    }

    return fn(this.result.result);
  }

  mapError<F extends Error>(fn: (arg: E) => F): Result<T, F> {
    if (this.result.success) {
      return (this as unknown) as Result<T, F>;
    }

    return new Err(fn(this.result.error)) as Result<T, F>;
  }

  inspect(fn: (arg: T) => void): this {
    if (this.result.success) {
      fn(this.result.result);
      return this;
    }

    return this;
  }

  inspectError(fn: (arg: E) => void): this {
    if (!this.result.success) {
      fn(this.result.error);
      return this;
    }

    return this;
  }

  expect(message: string) {
    if (!this.result.success) {
      throw new Error(message);
    }

    return this.result.result;
  }

  unwrap() {
    if (!this.result.success) {
      throw this.result.error;
    }

    return this.result.result;
  }

  expectError(message: string) {
    if (this.result.success) {
      throw new Error(message);
    }

    return this.result.error;
  }

  unwrapError() {
    if (this.result.success) {
      throw this.result.result;
    }

    return this.result.error;
  }

  and<U>(res: Result<U>): Result<U> {
    if (this.isOk() && res.isOk()) {
      return res;
    }

    if (this.isError()) {
      return this;
    }

    return res;
  }

  andThen<U>(fn: (arg: T) => Result<U>): Result<U> {
    if (this.isOk()) {
      return fn(this.result.result);
    }

    return this as Err;
  }

  async andThenAsync<U>(fn: (arg: T) => Promise<Result<U>>): Promise<Result<U>> {
    if (this.isOk()) {
      return fn(this.result.result);
    }

    return this as Err;
  }

  or(res: Result<T>): Result<T> {
    if (this.isOk()) {
      return this;
    }

    return res;
  }

  orElse<U>(fn: (arg: Error) => Result<U>) {
    if (!this.result.success) {
      return fn(this.result.error);
    }

    return this;
  }

  unwrapOr(def: T) {
    if (!this.result.success) {
      return def;
    }

    return this.result.result;
  }

  unwrapOrElse(fn: (arg: E) => T) {
    if (this.result.success) {
      return this.result.result;
    }

    return fn(this.result.error);
  }
}

export class Ok<T> extends Result<T> {
  declare result: RawResult<T> & { success: true };
  constructor(value: T) {
    super({
      success: true,
      result: value,
    });
  }
}
export class Err<T extends Error = Error> extends Result<any> {
  declare result: RawResult<any> & { success: false };
  constructor(error: T) {
    super({
      success: false,
      error,
    });
  }
}

type TryReturn<R, E extends Error> = R extends Promise<infer I> ? Promise<Result<I, E>> : Result<R, E>;

export function Try<R = any, E extends Error = Error>(fn: (...args: any[]) => R): TryReturn<R, E> {
  try {
    const possibleResultPromise = fn();
    const isPromiseLike = typeof (possibleResultPromise as any)?.then === "function";
    if (isPromiseLike) {
      return (possibleResultPromise as Promise<any>)
        .then((result) => {
          return new Ok(result);
        })
        .catch((e) => {
          const err =
            e instanceof Error ? e : new Error(typeof e === "string" ? e : "Could not execute given function");
          return new Err(err);
        }) as TryReturn<R, E>;
    }

    return new Ok(possibleResultPromise) as TryReturn<R, E>;
  } catch (e) {
    const err = e instanceof Error ? e : new Error(typeof e === "string" ? e : "Could not execute given function");
    return new Err(err) as TryReturn<R, E>;
  }
}
