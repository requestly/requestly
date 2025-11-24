import { BuiltInPackageProvider } from "./builtInPackageProvider";
import type { ExternalPackage, PackageProvider, PackageSource } from "./packageTypes";

/**
 * PackageRegistry
 *
 * Central registry for all external package providers used in the
 * scripts V2 execution worker. This is intentionally lightweight and
 * synchronous so it can be safely used in the worker context.
 *
 * For now we only register the built-in provider. In the future we can
 * add additional providers (npm, jsr, CDN-backed, etc.) here without
 * changing the call sites.
 */
export class PackageRegistry {
  private readonly providers: PackageProvider[] = [];

  /**
   * Register a new provider.
   *
   * We ensure at most one provider per `source` to avoid ambiguous
   * lookups. If a provider for that source is already registered,
   * this call becomes a no-op.
   */
  registerProvider(provider: PackageProvider): void {
    const alreadyRegistered = this.providers.some((p) => p.source === provider.source);
    if (alreadyRegistered) {
      return;
    }

    this.providers.push(provider);
  }

  /**
   * Returns all known packages from all providers.
   * This is primarily useful for the UI layer (search, listing, etc.).
   */
  listAllPackages(): ExternalPackage[] {
    const result: ExternalPackage[] = [];
    for (const provider of this.providers) {
      const pkgs = provider.listPackages();
      // Defensive copy to avoid providers accidentally mutating shared arrays.
      for (const pkg of pkgs) {
        result.push(pkg);
      }
    }
    return result;
  }

  /**
   * Lookup a package by its source and id.
   *
   * @example
   *   registry.getPackage("builtin", "lodash")
   */
  getPackage(source: PackageSource, id: string): ExternalPackage | undefined {
    const provider = this.providers.find((p) => p.source === source);
    if (!provider) {
      return undefined;
    }
    return provider.getPackageById(id);
  }

  /**
   * Convenience helper for looking up a package by a composite key.
   *
   * The key format is:
   *   "<source>:<id>"
   *
   * For example:
   *   "builtin:lodash"
   *   "builtin:moment"
   *
   * This format is future-proof for when we introduce additional sources.
   */
  getPackageByKey(key: string): ExternalPackage | undefined {
    if (!key) {
      return undefined;
    }

    const separatorIndex = key.indexOf(":");
    if (separatorIndex === -1) {
      // Key is malformed; we expect "<source>:<id>"
      return undefined;
    }

    const source = key.slice(0, separatorIndex) as PackageSource;
    const id = key.slice(separatorIndex + 1);

    if (!source || !id) {
      return undefined;
    }

    return this.getPackage(source, id);
  }
}

/**
 * Singleton accessor for the PackageRegistry used by the script
 * execution worker. This avoids having to pass registry instances
 * through multiple layers and keeps registry initialization DRY.
 */
let registryInstance: PackageRegistry | null = null;

export function getPackageRegistry(): PackageRegistry {
  if (registryInstance) {
    return registryInstance;
  }

  const registry = new PackageRegistry();

  // Register built-in provider. Additional providers (npm, jsr, etc.)
  // can be registered here in the future.
  registry.registerProvider(new BuiltInPackageProvider());

  registryInstance = registry;
  return registryInstance;
}
