import { NativeError } from "errors/NativeError";

export class DynamicVariableNotFoundError extends NativeError {
  constructor(name: string) {
    super(`${name} dynamic variable not found!`);
  }
}

export class DynamicVariableValueError extends NativeError {
  constructor(name: string, e: Error) {
    super(`Something went wrong while generating value for ${name} dynamic variable!`);
    this.set("stack", e.stack);
  }
}
