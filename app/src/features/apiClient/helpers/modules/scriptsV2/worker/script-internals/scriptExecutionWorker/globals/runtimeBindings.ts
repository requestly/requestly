import moment from "moment";
import * as xml2Js from "xml2js";
import * as uuid from "uuid";
import { parse } from "csv-parse/sync";
// @ts-ignore - cheerio has incomplete/loose typings for our usage pattern
import * as cheerio from "cheerio";
import * as chai from "chai";
import Ajv from "ajv";
import * as lodash from "lodash";

/**
 * Runtime bindings for built-in packages.
 * When adding a new built-in package:
 * 1. Add the package metadata to BUILTIN_PACKAGES in builtInPackageProvider.ts
 * 2. Add the runtime binding here, keyed by the `runtimeId` from step 1
 *
 * The key in this map MUST match the `runtimeId` field in builtInPackageProvider.ts
 */
const BUILTIN_RUNTIME_BINDINGS: Record<string, unknown> = {
  moment,
  xml2Js,
  xml2js: xml2Js,
  uuid,
  "csv-parse/lib/sync": parse,
  cheerio,
  chai,
  ajv: Ajv,
  lodash,
};

export function resolveRuntimeModule(runtimeId: string): unknown | undefined {
  return BUILTIN_RUNTIME_BINDINGS[runtimeId];
}
