import UserAgentRuleProcessor from "../../src/processors/UserAgentRuleProcessor";
import CONSTANTS from "../../../constants";
import { getUserAgentRule, URL_SOURCES } from "../helpers/MockObjects";

describe("UserAgentRuleProcessor:", function () {
  let userAgentRule, pair, sourceUrl;

  beforeEach(() => {
    userAgentRule = getUserAgentRule();
    pair = userAgentRule.pairs[0];
    sourceUrl = pair.source.value;
  });
  afterEach(() => {
    userAgentRule = null;
    pair = null;
    sourceUrl = null;
  });

  // TODO: @nsr skipping this test for now, need to understand requestType for UA rule
  xit("should override user agent for request from page in case type is mainFrame", function () {
    pair.source.requestType = CONSTANTS.REQUEST_TYPES.MAIN_FRAME;
    // RQ.StorageService.records.push(userAgentRule); // TODO: DON'T KNOW

    // // PageDomain Argument is now passed into the details object
    // spyOn(BG.Methods, "getMainFrameUrl").andCallFake(function () {
    //   return sourceUrl;
    // });
    const modifiedHeaders = UserAgentRuleProcessor.process({
      rule: userAgentRule,
      requestURL: URL_SOURCES.FACEBOOK,
      originalRequestHeaders: [],
      details: { pageDomain: URL_SOURCES.FACEBOOK },
    });
    expect(modifiedHeaders).not.toBeNull();
    expect(modifiedHeaders.length).toBe(1);
    expect(modifiedHeaders[0]["name"]).toBe(CONSTANTS.HEADER_NAMES.USER_AGENT);
    expect(modifiedHeaders[0]["value"]).toBe(pair.userAgent);
  });

  it("should not override user agent for request from page in case type is pageRequest", function () {
    pair.source.requestType = CONSTANTS.REQUEST_TYPES.PAGE_REQUEST;
    // RQ.StorageService.records.push(userAgentRule); // TODO: DON'T KNOW

    // // PageDomain Argument is now passed into the details object
    // spyOn(BG.Methods, "getMainFrameUrl").andCallFake(function () {
    //   return sourceUrl;
    // });
    const modifiedHeaders = UserAgentRuleProcessor.process({
      rule: userAgentRule,
      requestURL: URL_SOURCES.FACEBOOK,
      originalRequestHeaders: [],
      details: { pageDomain: URL_SOURCES.FACEBOOK },
    });
    expect(modifiedHeaders).toBeNull();
  });
});
