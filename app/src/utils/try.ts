type RawResult<T> =
  | {
      success: true;
      result: T;
    }
  | {
      success: false;
      error: Error;
    };

export abstract class Result<T> {
  constructor(readonly result: RawResult<T>) {}

  isOk() {
    return this.result.success;
  }

  isOkAnd(fn: (arg: T) => boolean) {
    return !this.result.success ? false : fn(this.result.result);
  }

  isError() {
    return !this.isOk();
  }

  isErrorAnd(fn: (arg: Error) => boolean) {
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

  mapOrElse<U>(def: (arg: Error) => U, fn: (arg: T) => U) {
    if (!this.result.success) {
      return def(this.result.error);
    }

    return fn(this.result.result);
  }

  mapError(fn: (arg: Error) => Error) {
    if (this.isOk()) {
      return this;
    }

    return new Err(fn(this.unwrapError()));
  }

  inspect(fn: (arg: T) => void) {
    if (this.result.success) {
      fn(this.result.result);
    }

    return this;
  }

  inspectError(fn: (arg: Error) => void) {
    if (!this.result.success) {
      fn(this.result.error);
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

  and<U>(res: Result<U>) {
    if (!this.isOk()) {
      return this;
    }

    if (!res.isOk()) {
      return res;
    }

    return res;
  }

  andThen<U>(fn: (arg: T) => Result<U>) {
    if (this.result.success) {
      return fn(this.result.result);
    }

    return this;
  }

  or<U>(res: Result<U>) {
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

  unwrapOrElse(fn: (arg: Error) => T) {
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

type TryReturn<R> = R extends Promise<infer I> ? Promise<Result<I>> : Result<R>;

export function Try<R = any>(fn: (...args: any[]) => R): TryReturn<R> {
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
        }) as TryReturn<R>;
    }

    return new Ok(possibleResultPromise) as TryReturn<R>;
  } catch (e) {
    const err = e instanceof Error ? e : new Error(typeof e === "string" ? e : "Could not execute given function");
    return new Err(err) as TryReturn<R>;
  }
}
