import RedirectRuleProcessor from "../../src/processors/RedirectRuleProcessor";
import { getRedirectRule, URL_SOURCES } from "../helpers/MockObjects";

describe("RedirectRuleProcessor:", function () {
  let redirectRule;

  beforeEach(() => (redirectRule = getRedirectRule()));
  afterEach(() => (redirectRule = null));

  it("should redirect Google to Quora", () => {
    redirectRule.pairs = [redirectRule.pairs[0]];
    expect(
      RedirectRuleProcessor.process({
        rule: redirectRule,
        requestURL: URL_SOURCES.GOOGLE,
      }).url
    ).toBe(URL_SOURCES.QUORA);
  });

  it("test wildcard matches operator in Redirect Rule", () => {
    redirectRule.pairs = [redirectRule.pairs[2]];
    expect(
      RedirectRuleProcessor.process({
        rule: redirectRule,
        requestURL: "https://cricket.yahoo.com",
      }).url
    ).toBe("https://cricket.yahoo.com?q1=https&q2=cricket");
  });
});
