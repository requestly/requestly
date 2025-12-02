import { ExternalPackage, PackageProvider, PackageSource } from "./packageTypes";

const BUILTIN_SOURCE: PackageSource = "builtin";

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

const BUILTIN_PACKAGES_BY_ID: Readonly<Record<string, ExternalPackage>> = BUILTIN_PACKAGES.reduce<
  Record<string, ExternalPackage>
>((acc, pkg) => {
  if (!acc[pkg.id]) {
    acc[pkg.id] = pkg;
  }
  return acc;
}, {});

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
