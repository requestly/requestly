import moment from "moment";
import * as xml2Js from "xml2js";
import * as uuid from "uuid";
import { parse } from "csv-parse/sync";
// @ts-ignore - cheerio has incomplete/loose typings for our usage pattern
import * as cheerio from "cheerio";
import * as chai from "chai";
import Ajv from "ajv";
import * as lodash from "lodash";

const BUILTIN_RUNTIME_BINDINGS: Record<string, unknown> = {
  // Date/time utilities
  moment,

  // XML parsing
  xml2Js,
  // Historically, scripts may use either "xml2Js" or "xml2js". We support both.
  xml2js: xml2Js,

  // UUID generation
  uuid,

  // CSV parsing (sync API)
  "csv-parse/lib/sync": parse,

  // HTML parsing / jQuery-like API
  cheerio,

  // Assertion library for tests in scripts
  chai,

  // JSON schema validation
  ajv: Ajv,

  // General-purpose utilities
  lodash,
};

export function resolveRuntimeModule(runtimeId: string): unknown | undefined {
  return BUILTIN_RUNTIME_BINDINGS[runtimeId];
}
