import { getPackageRegistry } from "./packageRegistry";
import { resolveRuntimeModule } from "./runtimeBindings";
import type { ExternalPackage } from "./packageTypes";

export function getRuntimeModuleForPackageKey(key: string): unknown | undefined {
  const pkg = safeGetPackageByKey(key);
  if (!pkg) {
    return undefined;
  }

  return resolveRuntimeModule(pkg.runtimeId);
}

function safeGetPackageByKey(key: string): ExternalPackage | undefined {
  if (typeof key !== "string" || key.length === 0) {
    return undefined;
  }

  const registry = getPackageRegistry();
  return registry.getPackageByKey(key);
}
