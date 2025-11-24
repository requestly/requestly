import { getPackageRegistry } from "./packageRegistry";
import { resolveRuntimeModule } from "./runtimeBindings";
import type { ExternalPackage } from "./packageTypes";

/**
 * Resolve a package by its composite key (e.g. "builtin:lodash") and
 * return the underlying runtime module instance.
 *
 * This composes the metadata registry (what packages exist, their ids
 * and runtimeIds) with the runtime bindings (how those runtimeIds are
 * mapped to actual imported modules).
 *
 * For the initial iteration, only "builtin" source packages are
 * supported, but the API is future-proof for additional sources
 * (e.g. "npm", "jsr") as long as they register a provider and
 * participate in the runtime binding resolution.
 *
 * @param key Composite package key in the form "<source>:<id>"
 */
export function getRuntimeModuleForPackageKey(key: string): unknown | undefined {
  const pkg = safeGetPackageByKey(key);
  if (!pkg) {
    return undefined;
  }

  return resolveRuntimeModule(pkg.runtimeId);
}

/**
 * Helper to retrieve an ExternalPackage by its composite key.
 * Kept internal for now to avoid leaking registry details to callers
 * that only care about runtime instances.
 */
function safeGetPackageByKey(key: string): ExternalPackage | undefined {
  if (typeof key !== "string" || key.length === 0) {
    return undefined;
  }

  const registry = getPackageRegistry();
  return registry.getPackageByKey(key);
}
