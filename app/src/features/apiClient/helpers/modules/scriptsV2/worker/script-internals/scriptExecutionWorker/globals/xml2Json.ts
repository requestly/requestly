
import * as xml2Js from 'xml2js';

const xml2jsOptions = {
  explicitArray: false,
  async: false,
  trim: true,
  mergeAttrs: false
};

export function xml2Json(string: string) {
  let JSON = {};

  xml2Js.parseString(string, xml2jsOptions, function(_: any, result: any) {
    JSON = result;
  });

  return JSON;
};


