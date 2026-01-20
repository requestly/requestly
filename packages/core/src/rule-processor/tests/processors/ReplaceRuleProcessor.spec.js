import ReplaceRuleProcessor from "../../src/processors/ReplaceRuleProcessor";
import { getReplaceRule, URL_SOURCES } from "../helpers/MockObjects";

describe("ReplaceRuleProcessor: ", function () {
  let replaceRule;

  beforeEach(() => (replaceRule = getReplaceRule()));
  afterEach(() => (replaceRule = null));

  it("should replace query parameter in the URL when source condition matches", () => {
    replaceRule.pairs = [replaceRule.pairs[1]];
    expect(
      ReplaceRuleProcessor.process({
        rule: replaceRule,
        requestURL: URL_SOURCES.DROPBOX + "?dl=0",
      }).url
    ).toBe(URL_SOURCES.DROPBOX + "?dl=1");
  });

  it("should not replace query parameter in the URL when Source condition does npt match", () => {
    replaceRule.pairs = [replaceRule.pairs[1]];
    expect(
      ReplaceRuleProcessor.process({
        rule: replaceRule,
        requestURL: URL_SOURCES.FACEBOOK + "?dl=0",
      })
    ).toBe(null);
  });
});
