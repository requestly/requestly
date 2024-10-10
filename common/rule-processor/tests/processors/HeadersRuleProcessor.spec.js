import HeadersRuleProcessor from "../../src/processors/HeadersRuleProcessor";
import CONSTANTS from "../../../constants";

import { getHeadersRuleV1, getHeadersRuleV2, URL_SOURCES } from "../helpers/MockObjects";

describe("HeadersRuleProcessor:", function () {
  let headersRule, headersRuleV2;

  beforeEach(() => {
    headersRule = getHeadersRuleV1();
    headersRuleV2 = getHeadersRuleV2();
  });
  afterEach(() => {
    headersRule = null;
    headersRuleV2 = null;
  });

  it("should return null when no header is modified", function () {
    headersRule.pairs = [];
    expect(
      HeadersRuleProcessor.process({
        rule: headersRule,
        requestURL: URL_SOURCES.FACEBOOK,
        typeOfHeaders: CONSTANTS.HEADERS_TARGET.REQUEST,
        originalHeaders: [],
      })
    ).toBeNull();
  });

  it("should return modified Headers Array when header is added", function () {
    const headersRuleResponse = HeadersRuleProcessor.process({
      rule: headersRule,
      requestURL: URL_SOURCES.FACEBOOK,
      typeOfHeaders: CONSTANTS.HEADERS_TARGET.REQUEST,
      originalHeaders: [],
    });
    expect(headersRuleResponse.newHeaders.length).toEqual(1);
  });

  it("should return modified Headers Array when header is removed", function () {
    var originalHeaders = [
      { name: "Accept-Language", value: "en-us" },
      { name: "Host", value: "example.com" },
      { name: "User-Agent", value: "Chrome" },
    ];

    headersRule.pairs[0]["type"] = CONSTANTS.MODIFICATION_TYPES.REMOVE;

    var headersRuleResponse = HeadersRuleProcessor.process({
      rule: headersRule,
      requestURL: URL_SOURCES.DROPBOX,
      typeOfHeaders: CONSTANTS.HEADERS_TARGET.REQUEST,
      originalHeaders,
    });
    expect(headersRuleResponse.newHeaders.length).toEqual(2);
  });

  // it("should replace PreDefinedFunction with its computed value", function () {
  //   var pair = headersRule.pairs[0];
  //   pair.header = "x-requestId";
  //   pair.value = "rq_rand(2)";

  //   RQ.StorageService.records.push(headersRule);
  //   var modifiedHeaders = BG.Methods.modifyHeaders(
  //     [],
  //     RQ.HEADERS_TARGET.REQUEST,
  //     { url: URL_SOURCES.FACEBOOK }
  //   );
  //   expect(modifiedHeaders.length).toBe(1);
  //   expect(modifiedHeaders[0]["name"]).toBe("x-requestId");
  //   expect(/^[0-9]+$/gi.test(modifiedHeaders[0]["value"])).toBe(true);
  // });

  // V2 schema rules
  it("should return null when no header is modified (V2 schema)", function () {
    headersRuleV2.pairs = [];
    expect(
      HeadersRuleProcessor.process({
        rule: headersRuleV2,
        requestURL: URL_SOURCES.FACEBOOK,
        typeOfHeaders: CONSTANTS.HEADERS_TARGET.REQUEST,
        originalHeaders: [],
      })
    ).toBeNull();
  });

  it("should return modified Headers Array when header is added (V2 schema)", function () {
    const headersRuleResponse = HeadersRuleProcessor.process({
      rule: headersRuleV2,
      requestURL: URL_SOURCES.FACEBOOK,
      typeOfHeaders: CONSTANTS.HEADERS_TARGET.REQUEST,
      originalHeaders: [],
    });
    expect(headersRuleResponse.newHeaders.length).toEqual(1);
  });

  it("should return modified Headers Array when header is removed (V2 schema)", function () {
    var originalHeaders = [
      { name: "Accept-Language", value: "en-us" },
      { name: "Host", value: "example.com" },
      { name: "User-Agent", value: "Mozilla/5.0" },
    ];

    headersRuleV2.pairs[0].modifications[CONSTANTS.HEADERS_TARGET.REQUEST][0]["type"] =
      CONSTANTS.MODIFICATION_TYPES.REMOVE;

    var headersRuleResponse = HeadersRuleProcessor.process({
      rule: headersRuleV2,
      requestURL: URL_SOURCES.DROPBOX,
      typeOfHeaders: CONSTANTS.HEADERS_TARGET.REQUEST,
      originalHeaders,
    });
    expect(headersRuleResponse.newHeaders.length).toEqual(2);
  });
});
