import { NativeError } from "../../../../../../../../../errors/NativeError";
import { resolveRuntimeModule } from "./runtimeBindings";

export class PackageNotFound extends NativeError {
  constructor(id: string) {
    super(`Could not find package ${id}`);
  }
}

export class PackageImportError extends NativeError {
  constructor(id: string, readonly internalError: any) {
    super(`Could not import "${id}"!!`);
  }
}

export function require(id: string) {
  const packageImport = resolveRuntimeModule(id);

  if (!packageImport) {
    throw new PackageNotFound(id);
  }

  return packageImport;
}
