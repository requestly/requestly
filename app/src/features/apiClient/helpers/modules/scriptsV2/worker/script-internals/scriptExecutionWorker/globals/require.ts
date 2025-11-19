import { NativeError } from "../../../../../../../../../errors/NativeError";
import moment from 'moment';
import * as xml2Js from 'xml2js';
import * as uuid from 'uuid';
import { parse } from 'csv-parse/sync';
//@ts-ignore
import * as cheerio from 'cheerio';
import * as chai from 'chai';
import ajv from 'ajv';
import * as lodash from 'lodash';


export class PackageNotFound extends NativeError {
  constructor(id: string) {
    super(`Could not find package ${id}`);
  }
}
export class PackageImportError extends NativeError {
	constructor(id: string, readonly internalError: any) {
		super(`Could not import "${id}"!!`);
	}
}

const packageMap: {[key: string]: Object | undefined} = {
  moment,
  xml2Js,
  xml2js: xml2Js,
  uuid,
  'csv-parse/lib/sync': parse,
  cheerio,
  //@ts-ignore
  chai,
  ajv,
  //@ts-ignore
  lodash,
}

export function require(id: string) {
  const packageImport = packageMap[id];
  if(!packageImport) {
    throw new PackageNotFound(id);
  }

  return packageImport;
}

