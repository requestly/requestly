import { ExternalPackage, PackageProvider, PackageSource } from "./packageTypes";

/**
 * Source identifier for all built-in packages.
 * This is intentionally narrow for now so we can
 * safely extend to "npm" | "jsr" | etc. later.
 */
const BUILTIN_SOURCE: PackageSource = "builtin";

/**
 * Central, curated list of built-in packages exposed to API Client scripts.
 *
 * NOTE:
 * - `id` should correspond to what the user/script would use in `require(id)`
 *   or import specifiers when we add ESM-style imports.
 * - `runtimeId` should match the keys used in runtimeBindings so that
 *   metadata and runtime resolution stay in sync.
 *
 * This file is intentionally free of any runtime imports. It only describes
 * metadata and is safe to use on both UI and worker sides.
 */
const BUILTIN_PACKAGES: ReadonlyArray<ExternalPackage> = [
  {
    id: "moment",
    source: BUILTIN_SOURCE,
    name: "Moment.js",
    description: "Date library for parsing, validating, manipulating, and formatting dates.",
    category: "date",
    tags: ["date", "time", "moment"],
    defaultImportStyle: "default",
    runtimeId: "moment",
  },
  {
    id: "xml2js",
    source: BUILTIN_SOURCE,
    name: "xml2js",
    description: "XML to JavaScript object converter.",
    category: "parser",
    tags: ["xml", "parser", "xml2js"],
    defaultImportStyle: "namespace",
    runtimeId: "xml2js",
  },
  {
    id: "uuid",
    source: BUILTIN_SOURCE,
    name: "uuid",
    description: "RFC-compliant UUID generation utilities.",
    category: "utility",
    tags: ["uuid", "id", "utility"],
    defaultImportStyle: "namespace",
    runtimeId: "uuid",
  },
  {
    id: "csv-parse/lib/sync",
    source: BUILTIN_SOURCE,
    name: "csv-parse (sync)",
    description: "Synchronous CSV parsing utilities.",
    category: "parser",
    tags: ["csv", "parser"],
    defaultImportStyle: "named",
    runtimeId: "csv-parse/lib/sync",
  },
  {
    id: "cheerio",
    source: BUILTIN_SOURCE,
    name: "Cheerio",
    description: "Server-side jQuery-like API for parsing and manipulating HTML.",
    category: "html",
    tags: ["html", "parser", "cheerio"],
    defaultImportStyle: "namespace",
    runtimeId: "cheerio",
  },
  {
    id: "chai",
    source: BUILTIN_SOURCE,
    name: "Chai",
    description: "Assertion library for tests written inside API Client scripts.",
    category: "testing",
    tags: ["assert", "testing", "chai"],
    defaultImportStyle: "namespace",
    runtimeId: "chai",
  },
  {
    id: "ajv",
    source: BUILTIN_SOURCE,
    name: "Ajv",
    description: "JSON schema validator.",
    category: "validation",
    tags: ["json", "schema", "validation", "ajv"],
    defaultImportStyle: "default",
    runtimeId: "ajv",
  },
  {
    id: "lodash",
    source: BUILTIN_SOURCE,
    name: "Lodash",
    description: "Utility library for arrays, objects, and other data structures.",
    category: "utility",
    tags: ["lodash", "utility", "collections"],
    defaultImportStyle: "namespace",
    runtimeId: "lodash",
  },
];

/**
 * Index packages by id for O(1) lookup.
 * Kept internal to avoid accidental mutation of the primary list.
 */
const BUILTIN_PACKAGES_BY_ID: Readonly<Record<string, ExternalPackage>> = BUILTIN_PACKAGES.reduce<
  Record<string, ExternalPackage>
>((acc, pkg) => {
  // In case of accidental duplicates, first one wins to avoid
  // surprising overrides. This is deliberate; duplicates should
  // be caught in tests / code review.
  if (!acc[pkg.id]) {
    acc[pkg.id] = pkg;
  }
  return acc;
}, {});

/**
 * Package provider for built-in libraries.
 *
 * This is the only provider registered in the initial iteration.
 * Additional providers (npm/jsr/CDN) can be added later without
 * changing callers, as long as they conform to PackageProvider.
 */
export class BuiltInPackageProvider implements PackageProvider {
  public readonly source: PackageSource = BUILTIN_SOURCE;

  listPackages(): ExternalPackage[] {
    // Return a shallow copy to prevent external mutation.
    return [...BUILTIN_PACKAGES];
  }

  getPackageById(id: string): ExternalPackage | undefined {
    return BUILTIN_PACKAGES_BY_ID[id];
  }
}
