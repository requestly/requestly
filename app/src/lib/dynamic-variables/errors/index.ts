import { NativeError } from "errors/NativeError";

export class DynamicVariableNotFoundError extends NativeError {
  constructor(name: string) {
    super(`${name} dynamic variable not found!`);
  }
}
