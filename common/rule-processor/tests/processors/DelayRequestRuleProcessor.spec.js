import DelayRequestRuleProcessor from "../../src/processors/DelayRequestRuleProcessor";
import { getDelayRequestRule, URL_SOURCES } from "../helpers/MockObjects";
/* CONSTANTS */
import LOCAL_CONSTANTS from "../../src/constants";
import CONSTANTS from "../../../constants";

describe("DelayRequestRuleProcessor:", function () {
  let delayRequestRule;

  describe("#applyDelayRequestRule", function () {
    beforeEach(() => {
      delayRequestRule = getDelayRequestRule();
    });
    afterEach(() => {
      delayRequestRule = null;
    });

    it("should be able to return the delay Action using contains match", function () {
      const delayRequestRuleResponse = DelayRequestRuleProcessor.process({
        rule: delayRequestRule,
        requestURL: URL_SOURCES.EXAMPLE,
      });
      const delay = delayRequestRule.pairs[0].delay;

      expect(delayRequestRuleResponse).toEqual({
        action: LOCAL_CONSTANTS.ACTIONS.ADD_DELAY,
        delay: delay,
        delayType: CONSTANTS.DELAY_REQUEST_CONSTANTS.DELAY_TYPE.CLIENT_SIDE,
      });
    });

    it("should be able to return the delay action using equals match", function () {
      const delayRequestRuleResponse = DelayRequestRuleProcessor.process({
        rule: delayRequestRule,
        requestURL: URL_SOURCES.DROPBOX,
      });
      const delay = delayRequestRule.pairs[4].delay;

      expect(delayRequestRuleResponse).toEqual({
        action: LOCAL_CONSTANTS.ACTIONS.ADD_DELAY,
        delay: delay,
        delayType: CONSTANTS.DELAY_REQUEST_CONSTANTS.DELAY_TYPE.CLIENT_SIDE,
      });
    });

    it("should be able to return the server-side delay action", function () {
      const delayRequestRuleResponse = DelayRequestRuleProcessor.process({
        rule: delayRequestRule,
        requestURL: URL_SOURCES.FACEBOOK,
      });
      const delay = delayRequestRule.pairs[3].delay;

      expect(delayRequestRuleResponse).toEqual({
        action: LOCAL_CONSTANTS.ACTIONS.ADD_DELAY,
        delay: delay,
        delayType: CONSTANTS.DELAY_REQUEST_CONSTANTS.DELAY_TYPE.SERVER_SIDE,
      });
    });

    it("should return null when URL does not match", function () {
      const delayRequestRuleResponse = DelayRequestRuleProcessor.process({
        rule: delayRequestRule,
        requestURL: URL_SOURCES.GOOGLE,
      });

      expect(delayRequestRuleResponse).toBeNull();
    });
  });
});
