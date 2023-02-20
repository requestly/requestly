import BlockRequestRuleProcessor from "../../src/processors/BlockRequestRuleProcessor";
import LOCAL_CONSTANTS from "../../src/constants";
import { getCancelRule, URL_SOURCES } from "../helpers/MockObjects";

describe("BlockRequestRuleProcessor:", function () {
  let cancelRule;

  beforeEach(() => (cancelRule = getCancelRule()));
  afterEach(() => (cancelRule = null));

  it("should block all requests containing a specific keyword", () => {
    cancelRule.pairs = [cancelRule.pairs[0]];
    expect(
      BlockRequestRuleProcessor.process({
        rule: cancelRule,
        requestURL: URL_SOURCES.GOOGLE + "?q=facebook",
      }).action
    ).toBe(LOCAL_CONSTANTS.ACTIONS.BLOCK);
  });

  it("should block URL with equals match", () => {
    cancelRule.pairs = [cancelRule.pairs[1]];
    expect(
      BlockRequestRuleProcessor.process({
        rule: cancelRule,
        requestURL: URL_SOURCES.FACEBOOK,
      }).action
    ).toBe(LOCAL_CONSTANTS.ACTIONS.BLOCK);
  });
});
