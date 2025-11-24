import { BuiltInPackageProvider } from "./builtInPackageProvider";
import type { ExternalPackage, PackageProvider, PackageSource } from "./packageTypes";

export class PackageRegistry {
  private readonly providers: PackageProvider[] = [];

  registerProvider(provider: PackageProvider): void {
    const alreadyRegistered = this.providers.some((p) => p.source === provider.source);
    if (alreadyRegistered) {
      return;
    }

    this.providers.push(provider);
  }

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

  getPackage(source: PackageSource, id: string): ExternalPackage | undefined {
    const provider = this.providers.find((p) => p.source === source);
    if (!provider) {
      return undefined;
    }
    return provider.getPackageById(id);
  }

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
