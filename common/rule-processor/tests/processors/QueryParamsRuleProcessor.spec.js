import QueryParamsRuleProcessor from "../../src/processors/QueryParamsRuleProcessor";
import { getQueryParamsRule, URL_SOURCES, sourceFilters, requestDetails } from "../helpers/MockObjects";

import CONSTANTS from "../../../constants";

describe("QueryParamsRuleProcessor:", function () {
  let queryParamsRule;

  describe("#applyQueryParamRule", function () {
    beforeEach(() => (queryParamsRule = getQueryParamsRule()));
    afterEach(() => (queryParamsRule = null));

    it("should be able to add query param", function () {
      expect(
        QueryParamsRuleProcessor.process({
          rule: queryParamsRule,
          requestURL: URL_SOURCES.EXAMPLE,
        }).url
      ).toBe(URL_SOURCES.EXAMPLE + "?a=1&b=2");
    });

    it("should apply query param rule if source filters are satisfied", function () {
      queryParamsRule.pairs[0].source.filters = sourceFilters;

      expect(
        QueryParamsRuleProcessor.process({
          rule: queryParamsRule,
          requestURL: URL_SOURCES.EXAMPLE,
          details: requestDetails,
        }).url
      ).toBe(URL_SOURCES.EXAMPLE + "?a=1&b=2");
    });
  });

  describe("#applyQueryParamModifications", function () {
    beforeEach(() => (queryParamsRule = getQueryParamsRule()));
    afterEach(() => (queryParamsRule = null));

    it("should be able to add query param", function () {
      expect(
        QueryParamsRuleProcessor.applyQueryParamModifications(
          queryParamsRule.pairs[0]["modifications"],
          URL_SOURCES.EXAMPLE
        )
      ).toBe(URL_SOURCES.EXAMPLE + "?a=1&b=2");
    });

    it("should overwrite the parameter if present", function () {
      expect(
        QueryParamsRuleProcessor.applyQueryParamModifications(
          queryParamsRule.pairs[0]["modifications"],
          URL_SOURCES.EXAMPLE + "?a=3"
        )
      ).toBe(URL_SOURCES.EXAMPLE + "?a=1&b=2");
    });

    it("should be able to remove the param", function () {
      queryParamsRule.pairs[0]["modifications"][0]["type"] = CONSTANTS.MODIFICATION_TYPES.REMOVE;
      expect(
        QueryParamsRuleProcessor.applyQueryParamModifications(
          queryParamsRule.pairs[0]["modifications"],
          URL_SOURCES.EXAMPLE + "?a=1"
        )
      ).toBe(URL_SOURCES.EXAMPLE + "?b=2");
    });

    it("add and remove param should not create any effect", function () {
      var modifications = queryParamsRule.pairs[0]["modifications"];

      modifications[0]["type"] = CONSTANTS.MODIFICATION_TYPES.ADD;
      modifications[0]["param"] = "a";

      modifications[1]["type"] = CONSTANTS.MODIFICATION_TYPES.REMOVE;
      modifications[1]["param"] = "a";

      expect(QueryParamsRuleProcessor.applyQueryParamModifications(modifications, URL_SOURCES.EXAMPLE)).toBe(
        URL_SOURCES.EXAMPLE
      );
      expect(QueryParamsRuleProcessor.applyQueryParamModifications(modifications, URL_SOURCES.EXAMPLE + "?b=2")).toBe(
        URL_SOURCES.EXAMPLE + "?b=2"
      );
      expect(QueryParamsRuleProcessor.applyQueryParamModifications(modifications, URL_SOURCES.EXAMPLE + "#hash")).toBe(
        URL_SOURCES.EXAMPLE + "#hash"
      );
    });

    it("removeAll and add should add only one param", function () {
      var modifications = queryParamsRule.pairs[0]["modifications"];

      modifications[0]["type"] = CONSTANTS.MODIFICATION_TYPES.REMOVE_ALL;

      modifications[1]["type"] = CONSTANTS.MODIFICATION_TYPES.ADD;
      modifications[1]["param"] = "a";
      modifications[1]["value"] = 1;

      expect(QueryParamsRuleProcessor.applyQueryParamModifications(modifications, URL_SOURCES.EXAMPLE)).toBe(
        URL_SOURCES.EXAMPLE + "?a=1"
      );
      expect(QueryParamsRuleProcessor.applyQueryParamModifications(modifications, URL_SOURCES.EXAMPLE + "?b=2")).toBe(
        URL_SOURCES.EXAMPLE + "?a=1"
      );
      expect(QueryParamsRuleProcessor.applyQueryParamModifications(modifications, URL_SOURCES.EXAMPLE + "#hash")).toBe(
        URL_SOURCES.EXAMPLE + "?a=1#hash"
      );
    });

    it("adding multiple modifications with special characters in values", function () {
      var modifications = queryParamsRule.pairs[0]["modifications"];

      modifications[0]["type"] = CONSTANTS.MODIFICATION_TYPES.ADD;
      modifications[0]["param"] = "q";
      modifications[0]["value"] = "@";

      modifications[1]["type"] = CONSTANTS.MODIFICATION_TYPES.ADD;
      modifications[1]["param"] = "a";
      modifications[1]["value"] = "1";

      expect(QueryParamsRuleProcessor.applyQueryParamModifications(modifications, URL_SOURCES.EXAMPLE)).toBe(
        URL_SOURCES.EXAMPLE + "?q=@&a=1"
      );
    });
  });

  describe("#applyQueryParamModification", function () {
    it("should remove param only when exists in params map", function () {
      const url = URL_SOURCES.EXAMPLE;
      const modification = {
        type: CONSTANTS.MODIFICATION_TYPES.REMOVE,
        param: "utm_source",
      };

      expect(QueryParamsRuleProcessor.applyQueryParamModification(modification, url)).toBe(url);
      expect(QueryParamsRuleProcessor.applyQueryParamModification(modification, url + "?utm_source=email")).toBe(url);
      expect(QueryParamsRuleProcessor.applyQueryParamModification(modification, url + "?utm_param=facebook")).toBe(
        url + "?utm_param=facebook"
      );
    });
  });
});
