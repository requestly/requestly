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

  // Direct binding lookup allows users to require packages using alternative identifiers
  // (e.g., "xml2Js" vs "xml2js") that may not be registered in the package registry
  // but are available in runtimeBindings. This provides flexibility for legacy aliases
  // and alternative casing conventions.
  const directBinding = resolveRuntimeModule(id);
  if (directBinding) {
    return directBinding;
  }

  throw new PackageNotFound(id);
}
