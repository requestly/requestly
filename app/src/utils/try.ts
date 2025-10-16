type RawTryResult<T> = {
  success: true,
  result: T
} | {
  success: false,
  error: Error,
};

export class TryResult<T> {
  constructor(readonly result: RawTryResult<T>) {

  }

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
    if(!this.result.success) {
      return this;
    }

    return new TryResult({
      success: true,
      result: fn(this.result.result),
    });
  }

  mapOr<K>(def: K, fn: (arg: T) => K) {
    if(!this.result.success) {
      return def;
    }

    return fn(this.result.result);
  }

  mapOrElse<U>(
    def: (arg: Error) => U,
    fn: (arg: T) => U,
  ) {
    if(!this.result.success) {
      return def(this.result.error);
    }

    return fn(this.result.result);
  }

  mapErr<K>(fn: (arg: Error) => K) {
    if(this.result.success) {
      return this;
    }

    return new TryResult({
      success: true,
      result: fn(this.result.error),
    });
  }

  expect(message: string) {
    if(!this.result.success) {
      throw new Error(message);
    }

    return this.result.result;
  }

  unwrap() {
    if(!this.result.success) {
      throw this.result.error;
    }

    return this.result.result;
  }

  expectError(message: string) {
    if(this.result.success) {
      throw new Error(message);
    }

    return this.result.error;
  }

  unwrapError() {
    if(this.result.success) {
      throw this.result.result;
    }

    return this.result.error;
  }
}

type TryReturn<R> = R extends Promise<infer I> ? Promise<TryResult<I>> : TryResult<R>

export function Try<R = any>(fn: (...args: any[]) => R): TryReturn<R> {
  try {
    const possibleResultPromise = fn();
    const isPromise = possibleResultPromise instanceof Promise;
    if(isPromise) {
      return possibleResultPromise.then(result => {
        return new TryResult({
          success: true,
          result,
        })
      }).catch(e => new TryResult({
        success: false,
        error: e,
      })) as TryReturn<R>;
    }

    return new TryResult({
      success: true,
      result: possibleResultPromise,
    }) as TryReturn<R>;

  }
  catch(e) {
    if(!(e instanceof Error)) {
      e = new Error(typeof e === 'string' ? e : 'Could not execute given function');
    }
     return new TryResult({
        success: false,
        error: e as Error,
     }) as TryReturn<R>;
  }
}
