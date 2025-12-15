import * as xml2Js from "xml2js";

const xml2jsOptions = {
  explicitArray: false,
  async: false,
  trim: true,
  mergeAttrs: false,
};

export function xml2Json(string: string) {
  let parsedResult = {};

  xml2Js.parseString(string, xml2jsOptions, function (err: any, result: any) {
    if (err) {
      throw new Error(`XML Parsing failed! ${err.message}`);
    }
    parsedResult = result;
  });

  return parsedResult;
}
