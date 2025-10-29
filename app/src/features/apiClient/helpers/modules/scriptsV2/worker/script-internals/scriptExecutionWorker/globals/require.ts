import { NativeError } from "../../../../../../../../../errors/NativeError";
import moment from 'moment';
import * as xml2Js from 'xml2js';


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
}

export function require(id: string) {
  const packageImport = packageMap[id];
  if(!packageImport) {
    throw new PackageNotFound(id);
  }

  return packageImport;
}

