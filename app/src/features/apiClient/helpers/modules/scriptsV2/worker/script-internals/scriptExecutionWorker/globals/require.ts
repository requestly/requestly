import { NativeError } from "../../../../../../../../../errors/NativeError";
import { resolveRuntimeModule } from "./runtimeBindings";
import { getPackageRegistry } from "./packageRegistry";

export class PackageNotFound extends NativeError {
  constructor(id: string) {
    super(`Could not find package ${id}`);
  }
}

export function require(id: string) {
  const registry = getPackageRegistry();

  const pkg = registry.getPackage("builtin", id);

  if (pkg) {
    const moduleBinding = resolveRuntimeModule(pkg.runtimeId);
    if (moduleBinding) {
      return moduleBinding;
    }
  }

  const directBinding = resolveRuntimeModule(id);
  if (directBinding) {
    return directBinding;
  }

  throw new PackageNotFound(id);
}
