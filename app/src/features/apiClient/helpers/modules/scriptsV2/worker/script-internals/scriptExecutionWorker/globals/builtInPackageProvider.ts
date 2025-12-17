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
    defaultVariableName: "moment",
    runtimeId: "moment",
    docsUrl: "https://momentjs.com/docs/",
    version: "2.29.4",
  },
  {
    id: "xml2js",
    source: BUILTIN_SOURCE,
    name: "xml2js",
    description: "XML to JavaScript object converter.",
    category: "parser",
    tags: ["xml", "parser", "xml2js"],
    defaultImportStyle: "namespace",
    defaultVariableName: "xml2js",
    runtimeId: "xml2js",
    docsUrl: "https://github.com/Leonidas-from-XIV/node-xml2js",
    version: "0.6.2",
  },
  {
    id: "uuid",
    source: BUILTIN_SOURCE,
    name: "uuid",
    description: "RFC-compliant UUID generation utilities.",
    category: "utility",
    tags: ["uuid", "id", "utility"],
    defaultImportStyle: "namespace",
    defaultVariableName: "uuid",
    runtimeId: "uuid",
    docsUrl: "https://github.com/uuidjs/uuid",
    version: "9.0.0",
  },
  {
    id: "csv-parse/lib/sync",
    source: BUILTIN_SOURCE,
    name: "csv-parse",
    description: "Synchronous CSV parsing utilities.",
    category: "parser",
    tags: ["csv", "parser"],
    defaultImportStyle: "named",
    defaultVariableName: "csvParse",
    runtimeId: "csv-parse/lib/sync",
    docsUrl: "https://csv.js.org/parse/",
    version: "5.5.2",
  },
  {
    id: "cheerio",
    source: BUILTIN_SOURCE,
    name: "Cheerio",
    description: "Server-side jQuery-like API for parsing and manipulating HTML.",
    category: "html",
    tags: ["html", "parser", "cheerio"],
    defaultImportStyle: "namespace",
    defaultVariableName: "cheerio",
    runtimeId: "cheerio",
    docsUrl: "https://cheerio.js.org/docs/intro",
    version: "1.0.0",
  },
  {
    id: "chai",
    source: BUILTIN_SOURCE,
    name: "Chai",
    description: "Assertion library for tests written inside API Client scripts.",
    category: "testing",
    tags: ["assert", "testing", "chai"],
    defaultImportStyle: "namespace",
    defaultVariableName: "chai",
    runtimeId: "chai",
    docsUrl: "https://www.chaijs.com/api/",
    version: "4.3.7",
  },
  {
    id: "ajv",
    source: BUILTIN_SOURCE,
    name: "Ajv",
    description: "JSON schema validator.",
    category: "validation",
    tags: ["json", "schema", "validation", "ajv"],
    defaultImportStyle: "default",
    defaultVariableName: "Ajv",
    runtimeId: "ajv",
    docsUrl: "https://ajv.js.org/guide/getting-started.html",
    version: "8.12.0",
  },
  {
    id: "lodash",
    source: BUILTIN_SOURCE,
    name: "Lodash",
    description: "Utility library for arrays, objects, and other data structures.",
    category: "utility",
    tags: ["lodash", "utility", "collections"],
    defaultImportStyle: "namespace",
    defaultVariableName: "_",
    runtimeId: "lodash",
    docsUrl: "https://lodash.com/docs/",
    version: "4.17.21",
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
