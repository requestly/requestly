export type PackageSource = "builtin"; // future: | 'npm' | 'jsr' | 'cdn';

export type PackageImportStyle = "namespace" | "default" | "named";

export interface ExternalPackage {
  /**
   * Identifier that is stable within a given source.
   *
   * For builtin packages this will typically match the require/import
   * string (e.g. "lodash", "csv-parse/lib/sync").
   */
  id: string;

  /**
   * Where this package comes from (builtin, npm, jsr, etc.).
   */
  source: PackageSource;

  /**
   * Human-readable name for display in the UI.
   */
  name: string;

  /**
   * Optional short description to show in popovers / search results.
   */
  description?: string;

  /**
   * Optional high-level category (e.g. "utility", "date", "parser").
   */
  category?: string;

  /**
   * Optional tags to improve search / filtering in the UI.
   */
  tags?: string[];

  /**
   * Preferred import style when generating code for this package.
   * This is *advisory*; runtime bindings do not depend on it.
   */
  defaultImportStyle?: PackageImportStyle;

  /**
   * Identifier used by the runtime layer to resolve the actual module.
   *
   * For builtin packages this might be the same as `id` or a more
   * specific key that maps into a bindings table (e.g. to support
   * aliases like "xml2Js" vs "xml2js").
   */
  runtimeId: string;

  /**
   * Optional provider-specific metadata that does not belong in
   * the core contract but is useful for particular sources or UIs.
   *
   * This is intentionally untyped to keep the core contract stable
   * while allowing controlled extension by providers.
   */
  meta?: Record<string, unknown>;
}

export interface PackageProvider {
  /**
   * Source identifier for this provider (e.g. "builtin").
   */
  readonly source: PackageSource;

  /**
   * List all packages exposed by this provider.
   *
   * This is primarily used for UI (search, popovers, etc.).
   */
  listPackages(): ExternalPackage[];

  /**
   * Resolve a single package by its ID within this provider.
   *
   * Returns `undefined` if no such package exists.
   */
  getPackageById(id: string): ExternalPackage | undefined;
}
