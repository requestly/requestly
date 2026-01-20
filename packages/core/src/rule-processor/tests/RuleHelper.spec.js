import RuleHelper from "../src/RuleHelper";
import { URL_SOURCES, KEYWORDS, getRedirectRule, getCancelRule } from "./helpers/MockObjects";
import CONSTANTS from "../../constants";

describe("RuleHelper: ", function () {
  let redirectRule, cancelRule;

  describe("#matchUrlWithRuleSource", function () {
    beforeEach(function () {
      redirectRule = getRedirectRule();
      cancelRule = getCancelRule();
    });

    afterEach(function () {
      redirectRule = null;
      cancelRule = null;
    });

    it("should match Redirect Rule Source", function () {
      var pair = redirectRule.pairs[0];

      // Equals Operator
      pair["destination"] = URL_SOURCES.YAHOO;
      expect(RuleHelper.matchUrlWithRuleSource(pair.source, URL_SOURCES.GOOGLE, pair.destination)).toBe(
        URL_SOURCES.YAHOO
      );

      pair["destination"] = URL_SOURCES.FACEBOOK;
      expect(RuleHelper.matchUrlWithRuleSource(pair.source, URL_SOURCES.GOOGLE, pair.destination)).toBe(
        URL_SOURCES.FACEBOOK
      );

      // Contains Operator
      pair["source"]["operator"] = CONSTANTS.RULE_OPERATORS.CONTAINS;
      pair["source"]["value"] = KEYWORDS.GOOGLE;
      expect(RuleHelper.matchUrlWithRuleSource(pair.source, URL_SOURCES.GOOGLE, pair.destination)).toBe(
        pair["destination"]
      );

      // Matches Operator
      pair["source"]["operator"] = CONSTANTS.RULE_OPERATORS.MATCHES;
      pair["source"]["value"] = "/TGT-([0-9]+)/gi";
      pair["destination"] = URL_SOURCES.REQUESTLY + "?query=TGT-$1";

      expect(
        RuleHelper.matchUrlWithRuleSource(pair.source, URL_SOURCES.GOOGLE_SEARCH_QUERY + "TGT-491", pair.destination)
      ).toBe(URL_SOURCES.REQUESTLY + "?query=TGT-491");

      expect(
        RuleHelper.matchUrlWithRuleSource(pair.source, URL_SOURCES.GOOGLE_SEARCH_QUERY + "TGT-10419", pair.destination)
      ).toBe(URL_SOURCES.REQUESTLY + "?query=TGT-10419");

      expect(RuleHelper.matchUrlWithRulePairs(redirectRule.pairs, "https://cricket.yahoo.com")).toBe(
        "https://cricket.yahoo.com?q1=https&q2=cricket"
      );
    });

    it("should match different Url components", function () {
      var pair = redirectRule.pairs[1];

      // Host Matching
      expect(RuleHelper.matchUrlWithRuleSource(pair.source, URL_SOURCES.DROPBOX, pair.destination)).toBe(
        URL_SOURCES.FACEBOOK
      );

      expect(
        RuleHelper.matchUrlWithRuleSource(pair.source, URL_SOURCES.EXAMPLE + "?ref=dropbox", pair.destination)
      ).toBe(null);

      // Path Matching
      pair.source.key = CONSTANTS.RULE_KEYS.PATH;
      expect(RuleHelper.matchUrlWithRuleSource(pair.source, URL_SOURCES.DROPBOX, pair.destination)).toBe(null);

      expect(
        RuleHelper.matchUrlWithRuleSource(pair.source, URL_SOURCES.EXAMPLE + "/dropbox/home.html", pair.destination)
      ).toBe(URL_SOURCES.FACEBOOK);
    });

    it("should return null when Cancel Rule Source does not match with Url", function () {
      var pairs = cancelRule.pairs;

      expect(RuleHelper.matchUrlWithRuleSource(pairs[0].source, URL_SOURCES.GOOGLE)).toBeNull();
      expect(RuleHelper.matchUrlWithRuleSource(pairs[1].source, URL_SOURCES.FACEBOOK)).not.toBeNull();
    });

    it("should not match url with black list domains", function () {
      var pairs = redirectRule.pairs;

      pairs[0]["source"]["operator"] = CONSTANTS.RULE_OPERATORS.CONTAINS;
      pairs[0]["source"]["value"] = "requestly";

      expect(RuleHelper.matchUrlWithRuleSource(pairs[0].source, "http://blog.requestly.in")).toBeNull();
      expect(RuleHelper.matchUrlWithRuleSource(pairs[0].source, "http://web.requestly.in")).toBeNull();
      expect(
        RuleHelper.matchUrlWithRuleSource(pairs[0].source, "http://quora.com?search=requestly", URL_SOURCES.GOOGLE)
      ).toBe(URL_SOURCES.GOOGLE);
    });
  });

  describe("#checkRegexMatch", function () {
    it("should return no finalString and matches when inputString does not match regex", function () {
      expect(RuleHelper.checkRegexMatch("/(.+).yahoo.com", "https://google.com", null)).toEqual({
        destination: null,
        matches: [],
      });
    });

    it("should return no finalString and matches when regexString is not valid Regex", function () {
      expect(RuleHelper.checkRegexMatch("invalid/regex", "/path", "")).toEqual({
        destination: null,
        matches: [],
      });
    });

    it("should return the final string as is when there are no groups in regex", function () {
      var d = "dest";
      expect(RuleHelper.checkRegexMatch("/yahoo/ig", "http://cricket.yahoo.com", d)).toEqual({
        destination: d,
        matches: ["yahoo"],
      });
    });

    it("should replace group values in final string when there are groups in regex", function () {
      expect(RuleHelper.checkRegexMatch("/(.+).yahoo.com\\?q=(.+)/", "cricket.yahoo.com?q=rocks", "$1-$2")).toEqual({
        destination: "cricket-rocks",
        matches: ["cricket.yahoo.com?q=rocks", "cricket", "rocks"],
      });

      expect(RuleHelper.checkRegexMatch("/(.+).yahoo.com\\?q=(.+)/", "mail.yahoo.com?q=sucks", "$1-$2")).toEqual({
        destination: "mail-sucks",
        matches: ["mail.yahoo.com?q=sucks", "mail", "sucks"],
      });
    });

    it("should convert extra/unmatched group values to empty string in final string", function () {
      expect(RuleHelper.checkRegexMatch("/(.+).yahoo.com\\?q=(.+)/", "cricket.yahoo.com?q=rocks", "$1-$2$3.")).toEqual({
        destination: "cricket-rocks$3.",
        matches: ["cricket.yahoo.com?q=rocks", "cricket", "rocks"],
      });

      expect(RuleHelper.checkRegexMatch("/(.+).yahoo.com\\?q=(.+)/", "mail.yahoo.com?q=sucks", "$1-$2$3.")).toEqual({
        destination: "mail-sucks$3.",
        matches: ["mail.yahoo.com?q=sucks", "mail", "sucks"],
      });
    });
  });

  describe("#checkWildCardMatch", function () {
    it("should return null when wildcard expression does not match", function () {
      expect(RuleHelper.checkWildCardMatch("http://exam*.com", "https://example.com", "$1")).toEqual({
        destination: null,
        matches: [],
      });
      expect(RuleHelper.checkWildCardMatch("http://*exam*.com", "http://exercise.com", "$2-$1")).toEqual({
        destination: null,
        matches: [],
      });
    });

    it("should replace $ values as empty string when empty values satisfy the input", function () {
      expect(
        RuleHelper.checkWildCardMatch("http://*example*.com", "http://example.com", "http://$1example$2.com")
      ).toEqual({ destination: "http://example.com", matches: ["", "", ""] });
    });

    it("should replace $ values in final string when there is match", function () {
      expect(RuleHelper.checkWildCardMatch("http://*exam*.com", "http://example.com", "$2-$1")).toEqual({
        destination: "ple-",
        matches: ["", "", "ple"],
      });
      expect(RuleHelper.checkWildCardMatch("*://exam*.com", "http://example.com", "$1_$2")).toEqual({
        destination: "http_ple",
        matches: ["", "http", "ple"],
      });
      expect(RuleHelper.checkWildCardMatch("*://example.*", "http://example.com", "$1_$2")).toEqual({
        destination: "http_com",
        matches: ["", "http", "com"],
      });
      expect(RuleHelper.checkWildCardMatch("http://*.*", "http://cricket.yahoo.com", "$1_$2")).toEqual({
        destination: "cricket_yahoo.com",
        matches: ["", "cricket", "yahoo.com"],
      });
      expect(RuleHelper.checkWildCardMatch("http://*.*.*", "http://cricket.yahoo.com", "$1_$2_$3")).toEqual({
        destination: "cricket_yahoo_com",
        matches: ["", "cricket", "yahoo", "com"],
      });
      expect(
        RuleHelper.checkWildCardMatch(
          "*?qp1=*&qp2=*",
          "http://requestly.in?qp1=web&qp2=library",
          "http://$2.requestly.in/$3service"
        )
      ).toEqual({
        destination: "http://web.requestly.in/libraryservice",
        matches: ["", "http://requestly.in", "web", "library"],
      });
    });
  });

  describe("#matchValueForPredefinedFunctions ", function () {
    it("should return original value when value is falsy", function () {
      expect(RuleHelper.matchValueForPredefinedFunctions("", {})).toBe("");
      expect(RuleHelper.matchValueForPredefinedFunctions(null, {})).toBe(null);
    });
  });

  describe("#matchUrlWithRulePairs", function () {
    it("should execute multiple pairs of a rule", function () {
      var r = getRedirectRule(),
        pairs = [];

      pairs.push(
        {
          source: {
            key: CONSTANTS.RULE_KEYS.URL,
            operator: CONSTANTS.RULE_OPERATORS.EQUALS,
            value: URL_SOURCES.GOOGLE,
          },
          destination: URL_SOURCES.YAHOO,
        },
        {
          source: {
            key: CONSTANTS.RULE_KEYS.URL,
            operator: CONSTANTS.RULE_OPERATORS.EQUALS,
            value: URL_SOURCES.DROPBOX,
          },
          destination: URL_SOURCES.QUORA,
        },
        {
          source: {
            key: CONSTANTS.RULE_KEYS.URL,
            operator: CONSTANTS.RULE_OPERATORS.CONTAINS,
            value: KEYWORDS.YAHOO,
          },
          destination: URL_SOURCES.FACEBOOK,
        }
      );

      r.pairs = pairs;

      expect(RuleHelper.matchUrlWithRulePairs(r.pairs, URL_SOURCES.GOOGLE)).toBe(URL_SOURCES.FACEBOOK);
    });
  });

  describe("match source filters", function () {
    const sourceFilters = {
      [CONSTANTS.RULE_SOURCE_FILTER_TYPES.PAGE_URL]: [
        {
          operator: CONSTANTS.RULE_OPERATORS.CONTAINS,
          value: KEYWORDS.EXAMPLE,
        },
      ],
      [CONSTANTS.RULE_SOURCE_FILTER_TYPES.RESOURCE_TYPE]: ["script", "stylesheet"],
      [CONSTANTS.RULE_SOURCE_FILTER_TYPES.REQUEST_METHOD]: ["GET", "POST"],
      [CONSTANTS.RULE_SOURCE_FILTER_TYPES.REQUEST_DATA]: {
        key: "a.b.c",
        value: 123,
      },
    };

    describe("#matchPageUrlFilter", function () {
      const requestDetails = { tabId: 123 };

      it("should return true if page url filter is satisfied", function () {
        const pageUrlFilter = sourceFilters[CONSTANTS.RULE_SOURCE_FILTER_TYPES.PAGE_URL][0];
        requestDetails.pageUrl = URL_SOURCES.EXAMPLE;

        //spyOn(window.tabService, "getTabUrl").andReturn(URL_SOURCES.EXAMPLE);
        expect(RuleHelper.matchPageUrlFilter(pageUrlFilter, requestDetails)).toBeTruthy();
      });

      it("should return false if page url filter is not satisfied", function () {
        const pageUrlFilter = sourceFilters[CONSTANTS.RULE_SOURCE_FILTER_TYPES.PAGE_URL][0];
        requestDetails.pageUrl = URL_SOURCES.GOOGLE;

        //spyOn(window.tabService, "getTabUrl").andReturn(URL_SOURCES.GOOGLE);
        expect(RuleHelper.matchPageUrlFilter(pageUrlFilter, requestDetails)).toBeFalsy();
      });
    });

    describe("#matchRequestWithRuleSourceFilters", function () {
      it("should return true only if all source filters are satisfied", function () {
        const requestDetails = {
          tabId: 123,
          method: "GET",
          type: "script",
          pageUrl: URL_SOURCES.EXAMPLE,
          requestData: {
            a: { b: { c: "123" } },
          },
        };

        //spyOn(window.tabService, "getTabUrl").andReturn(URL_SOURCES.EXAMPLE);
        expect(RuleHelper.matchRequestWithRuleSourceFilters(sourceFilters, requestDetails)).toBeTruthy();
      });

      it("should return false if page url filter is not satisfied", function () {
        const requestDetails = {
          tabId: 123,
          method: "GET",
          type: "script",
          pageUrl: URL_SOURCES.GOOGLE,
        };

        //spyOn(window.tabService, "getTabUrl").andReturn(URL_SOURCES.GOOGLE);
        expect(RuleHelper.matchRequestWithRuleSourceFilters(sourceFilters, requestDetails)).toBeFalsy();
      });

      it("should return false if request method filter is not satisfied", function () {
        const requestDetails = {
          tabId: 123,
          method: "OPTIONS",
          type: "script",
          pageUrl: URL_SOURCES.EXAMPLE,
        };

        //spyOn(window.tabService, "getTabUrl").andReturn(URL_SOURCES.EXAMPLE);
        expect(RuleHelper.matchRequestWithRuleSourceFilters(sourceFilters, requestDetails)).toBeFalsy();
      });

      it("should return false if request type filter is not satisfied", function () {
        const requestDetails = {
          tabId: 123,
          method: "GET",
          type: "xmlhttprequest",
          pageUrl: URL_SOURCES.EXAMPLE,
        };

        //spyOn(window.tabService, "getTabUrl").andReturn(URL_SOURCES.EXAMPLE);
        expect(RuleHelper.matchRequestWithRuleSourceFilters(sourceFilters, requestDetails)).toBeFalsy();
      });

      it("should return false if request data filter is not satisfied", function () {
        const requestDetails = {
          tabId: 123,
          method: "POST",
          type: "script",
          pageUrl: URL_SOURCES.EXAMPLE,
          requestData: {
            foo: "bar",
          },
        };

        //spyOn(window.tabService, "getTabUrl").andReturn(URL_SOURCES.EXAMPLE);
        expect(RuleHelper.matchRequestWithRuleSourceFilters(sourceFilters, requestDetails)).toBeFalsy();
      });
    });
  });

  describe("#headerModificationTypes", function () {
    var originalHeaders;

    beforeEach(function () {
      originalHeaders = [
        { name: "Accept-Language", value: "en-us" },
        { name: "Host", value: "example.com" },
        { name: "User-Agent", value: "Chrome" },
      ];
    });

    afterEach(function () {
      originalHeaders = null;
    });

    it("addHeader should add header irrespective of header is present or not earlier", function () {
      RuleHelper.addHeader(originalHeaders, {
        name: "Host",
        value: "requestly.io",
      });
      expect(originalHeaders.length).toBe(4);

      RuleHelper.addHeader(originalHeaders, {
        name: "user-agent",
        value: "Firefox",
      });
      expect(originalHeaders.length).toBe(5);
    });

    it("removeHeader should remove header when header is present", function () {
      RuleHelper.removeHeader(originalHeaders, "Host");
      expect(originalHeaders.length).toBe(2);

      // Note we did not add - between User and Agent so it should not delete this header
      RuleHelper.removeHeader(originalHeaders, "UserAgent");
      expect(originalHeaders.length).toBe(2);
    });

    it("removeHeader should remove all instances of headers", function () {
      var containsHeader = function (headers, header) {
        for (var i = 0; i < headers.length; i++) {
          if (headers[i].name === header) {
            return true;
          }
        }
        return false;
      };

      originalHeaders.push(
        { name: "Set-Cookie", value: "name1=value1" },
        { name: "Cache-Control", value: "no-cache" },
        { name: "Set-Cookie", value: "name2=value2" },
        { name: "Cache-Control", value: "no-store" }
      );

      RuleHelper.removeHeader(originalHeaders, "Set-Cookie");
      expect(containsHeader(originalHeaders, "Set-Cookie")).toBe(false);

      RuleHelper.removeHeader(originalHeaders, "Cache-Control");
      expect(containsHeader(originalHeaders, "Cache-Control")).toBe(false);
    });

    it("modifyHeader should modify header only when header is present", function () {
      RuleHelper.modifyHeaderIfExists(originalHeaders, {
        name: "Host",
        value: "requestly.in",
      });
      expect(originalHeaders.length).toBe(3);
      expect(originalHeaders[1]["value"]).toBe("requestly.in");

      // Should not do anything
      RuleHelper.modifyHeaderIfExists(originalHeaders, {
        name: "cookie",
        value: "session_id",
      });
      expect(originalHeaders.length).toBe(3);
    });

    it("replaceHeader should modify header when header is present otherwise should add header", function () {
      RuleHelper.replaceHeader(originalHeaders, {
        name: "Host",
        value: "requestly.in",
      });
      expect(originalHeaders.length).toBe(3);
      expect(originalHeaders[2]["value"]).toBe("requestly.in");

      // Should Insert new header when header is not present
      RuleHelper.replaceHeader(originalHeaders, {
        name: "cookie",
        value: "session_id",
      });
      expect(originalHeaders.length).toBe(4);
    });
  });
});
