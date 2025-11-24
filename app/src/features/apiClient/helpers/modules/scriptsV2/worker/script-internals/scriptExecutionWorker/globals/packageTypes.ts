/**
 * Shared types and interfaces for external library (package) support
 * used by the API Client script execution environment.
 *
 * This file is intentionally small and generic so it can be reused
 * by multiple providers (builtin, npm, jsr, etc.) and by both
 * runtime and UI layers.
 */

/**
 * Source of a package – where it comes from.
 *
 * For the initial iteration we only support "builtin" packages that
 * are shipped and bundled with the product. This is intentionally
 * typed as a union so we can safely extend it in future iterations
 * (e.g. "npm", "jsr", "cdn").
 */
export type PackageSource = "builtin"; // future: | 'npm' | 'jsr' | 'cdn';

/**
 * Import style that the UI / code generator should prefer when
 * inserting this package into user scripts.
 *
 * - "namespace":   import * as _ from 'lodash'
 * - "default":     import moment from 'moment'
 * - "named":       import { parse } from 'csv-parse/sync'
 */
export type PackageImportStyle = "namespace" | "default" | "named";

/**
 * Core metadata for a single external package that can be exposed
 * to the API Client script environment.
 *
 * This type is deliberately UI- and runtime-friendly:
 * - `id` and `source` uniquely identify the package.
 * - `runtimeId` is used by the runtime layer to resolve an actual
 *   module instance (e.g. from a bindings map or dynamic import).
 * - Optional fields (`description`, `category`, `tags`, `meta`)
 *   help power richer UIs without affecting the runtime.
 */
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

/**
 * Interface implemented by all package providers.
 *
 * Each provider is responsible for:
 * - Exposing a set of packages from a particular source.
 * - Resolving a package by ID within that source.
 *
 * The registry composes multiple providers to present a unified view.
 */
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
