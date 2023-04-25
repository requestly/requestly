describe("RuleMatcher: ", function () {
  var redirectRule,
    cancelRule,
    requestDetails = {
      tabId: 123,
      method: "GET",
      type: "xmlhttprequest",
    };

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
      expect(
        RuleMatcher.matchUrlWithRuleSource(
          pair.source,
          URL_SOURCES.GOOGLE,
          requestDetails.tabId,
          pair.destination
        )
      ).toBe(URL_SOURCES.YAHOO);

      pair["destination"] = URL_SOURCES.FACEBOOK;
      expect(
        RuleMatcher.matchUrlWithRuleSource(
          pair.source,
          URL_SOURCES.GOOGLE,
          requestDetails.tabId,
          pair.destination
        )
      ).toBe(URL_SOURCES.FACEBOOK);

      // Contains Operator
      pair["source"]["operator"] = RQ.RULE_OPERATORS.CONTAINS;
      pair["source"]["value"] = KEYWORDS.GOOGLE;
      expect(
        RuleMatcher.matchUrlWithRuleSource(
          pair.source,
          URL_SOURCES.GOOGLE,
          requestDetails.tabId,
          pair.destination
        )
      ).toBe(pair["destination"]);

      // Matches Operator
      pair["source"]["operator"] = RQ.RULE_OPERATORS.MATCHES;
      pair["source"]["value"] = "/TGT-([0-9]+)/gi";
      pair["destination"] = URL_SOURCES.REQUESTLY + "?query=TGT-$1";

      expect(
        RuleMatcher.matchUrlWithRuleSource(
          pair.source,
          URL_SOURCES.GOOGLE_SEARCH_QUERY + "TGT-491",
          requestDetails.tabId,
          pair.destination
        )
      ).toBe(URL_SOURCES.REQUESTLY + "?query=TGT-491");

      expect(
        RuleMatcher.matchUrlWithRuleSource(
          pair.source,
          URL_SOURCES.GOOGLE_SEARCH_QUERY + "TGT-10419",
          requestDetails.tabId,
          pair.destination
        )
      ).toBe(URL_SOURCES.REQUESTLY + "?query=TGT-10419");

      expect(
        RuleMatcher.matchUrlWithRulePairs(
          redirectRule.pairs,
          "https://cricket.yahoo.com",
          requestDetails
        )
      ).toBe("https://cricket.yahoo.com?q1=https&q2=cricket");
    });

    it("should match different Url components", function () {
      var pair = redirectRule.pairs[1];

      // Host Matching
      expect(
        RuleMatcher.matchUrlWithRuleSource(
          pair.source,
          URL_SOURCES.DROPBOX,
          requestDetails.tabId,
          pair.destination
        )
      ).toBe(URL_SOURCES.FACEBOOK);

      expect(
        RuleMatcher.matchUrlWithRuleSource(
          pair.source,
          URL_SOURCES.EXAMPLE + "?ref=dropbox",
          requestDetails.tabId,
          pair.destination
        )
      ).toBe(null);

      // Path Matching
      pair.source.key = RQ.RULE_KEYS.PATH;
      expect(
        RuleMatcher.matchUrlWithRuleSource(
          pair.source,
          URL_SOURCES.DROPBOX,
          requestDetails.tabId,
          pair.destination
        )
      ).toBe(null);

      expect(
        RuleMatcher.matchUrlWithRuleSource(
          pair.source,
          URL_SOURCES.EXAMPLE + "/dropbox/home.html",
          requestDetails.tabId,
          pair.destination
        )
      ).toBe(URL_SOURCES.FACEBOOK);
    });

    it("should return null when Cancel Rule Source does not match with Url", function () {
      var pairs = cancelRule.pairs;

      expect(
        RuleMatcher.matchUrlWithRuleSource(
          pairs[0].source,
          URL_SOURCES.GOOGLE,
          requestDetails.tabId
        )
      ).toBeNull();
      expect(
        RuleMatcher.matchUrlWithRuleSource(
          pairs[1].source,
          URL_SOURCES.FACEBOOK,
          requestDetails.tabId
        )
      ).not.toBeNull();
    });

    it("should not match url with black list domains", function () {
      var pairs = redirectRule.pairs;

      pairs[0]["source"]["operator"] = RQ.RULE_OPERATORS.CONTAINS;
      pairs[0]["source"]["value"] = "requestly";

      expect(
        RuleMatcher.matchUrlWithRuleSource(
          pairs[0].source,
          "http://blog.requestly.in",
          requestDetails.tabId
        )
      ).toBeNull();
      expect(
        RuleMatcher.matchUrlWithRuleSource(
          pairs[0].source,
          "http://web.requestly.in",
          requestDetails.tabId
        )
      ).toBeNull();
      expect(
        RuleMatcher.matchUrlWithRuleSource(
          pairs[0].source,
          "http://quora.com?search=requestly",
          requestDetails.tabId,
          URL_SOURCES.GOOGLE
        )
      ).toBe(URL_SOURCES.GOOGLE);
    });
  });

  describe("#matchUrlWithPageSource", function () {
    beforeEach(function () {
      pageSources = getPageSources();
    });

    afterEach(function () {
      pageSources = null;
    });

    it("should match different Url components", function () {
      var pageSource = pageSources[1];

      // Host Matching
      expect(
        RuleMatcher.matchUrlWithPageSource(pageSource, URL_SOURCES.DROPBOX)
      ).toBe("");

      expect(
        RuleMatcher.matchUrlWithPageSource(
          pageSource,
          URL_SOURCES.EXAMPLE + "?ref=dropbox"
        )
      ).toBe(null);

      // Path Matching
      pageSource.key = RQ.RULE_KEYS.PATH;
      expect(
        RuleMatcher.matchUrlWithPageSource(pageSource, URL_SOURCES.DROPBOX)
      ).toBe(null);

      expect(
        RuleMatcher.matchUrlWithPageSource(
          pageSource,
          URL_SOURCES.EXAMPLE + "/dropbox/home.html"
        )
      ).toBe("");
    });

    it("should return null when Page Source does not match with Url", function () {
      expect(
        RuleMatcher.matchUrlWithPageSource(pageSources[0], URL_SOURCES.GOOGLE)
      ).not.toBeNull();

      expect(
        RuleMatcher.matchUrlWithPageSource(pageSources[1], URL_SOURCES.FACEBOOK)
      ).toBeNull();

      expect(
        RuleMatcher.matchUrlWithPageSource(
          pageSources[2],
          `example.${KEYWORDS.YAHOO}.com`
        )
      ).toBeNull();

      expect(
        RuleMatcher.matchUrlWithPageSource(
          pageSources[2],
          `https://example.${KEYWORDS.YAHOO}.com`
        )
      ).not.toBeNull();
    });
  });

  describe("#checkRegexMatch", function () {
    it("should return null when inputString does not match regex", function () {
      expect(
        RuleMatcher.checkRegexMatch(
          "/(.+).yahoo.com",
          "https://google.com",
          null
        )
      ).toBeNull();
    });

    it("should return null when regexString is not valid Regex", function () {
      expect(
        RuleMatcher.checkRegexMatch("invalid/regex", "/path", "")
      ).toBeNull();
    });

    it("should return the final string as is when there are no groups in regex", function () {
      var d = "dest";
      expect(
        RuleMatcher.checkRegexMatch("/yahoo/ig", "http://cricket.yahoo.com", d)
      ).toBe(d);
    });

    it("should replace group values in final string when there are groups in regex", function () {
      expect(
        RuleMatcher.checkRegexMatch(
          "/(.+).yahoo.com?q=(.+)",
          "cricket.yahoo.com?q=rocks",
          "$1-$2"
        )
      ).toBeNull("cricket-rocks");
      expect(
        RuleMatcher.checkRegexMatch(
          "/(.+).yahoo.com?q=(.+)",
          "mail.yahoo.com?q=sucks",
          "$1-$2"
        )
      ).toBeNull("mail-sucks");
    });

    it("should convert extra/unmatched group values to empty string in final string", function () {
      expect(
        RuleMatcher.checkRegexMatch(
          "/(.+).yahoo.com?q=(.+)",
          "cricket.yahoo.com?q=rocks",
          "$1-$2$3."
        )
      ).toBeNull("cricket-rocks.");
      expect(
        RuleMatcher.checkRegexMatch(
          "/(.+).yahoo.com?q=(.+)",
          "mail.yahoo.com?q=sucks",
          "$1-$2$3."
        )
      ).toBeNull("mail-sucks.");
    });
  });

  describe("#checkWildCardMatch", function () {
    it("should return null when wildcard expression does not match", function () {
      expect(
        RuleMatcher.checkWildCardMatch(
          "http://exam*.com",
          "https://example.com",
          "$1"
        )
      ).toBeNull();
      expect(
        RuleMatcher.checkWildCardMatch(
          "http://*exam*.com",
          "http://exercise.com",
          "$2-$1"
        )
      ).toBeNull();
    });

    it("should replace $ values as empty string when empty values satisfy the input", function () {
      expect(
        RuleMatcher.checkWildCardMatch(
          "http://*example*.com",
          "http://example.com",
          "http://$1example$2.com"
        )
      ).toBe("http://example.com");
    });

    it("should replace $ values in final string when there is match", function () {
      expect(
        RuleMatcher.checkWildCardMatch(
          "http://*exam*.com",
          "http://example.com",
          "$2-$1"
        )
      ).toBe("ple-");
      expect(
        RuleMatcher.checkWildCardMatch(
          "*://exam*.com",
          "http://example.com",
          "$1_$2"
        )
      ).toBe("http_ple");
      expect(
        RuleMatcher.checkWildCardMatch(
          "*://example.*",
          "http://example.com",
          "$1_$2"
        )
      ).toBe("http_com");
      expect(
        RuleMatcher.checkWildCardMatch(
          "http://*.*",
          "http://cricket.yahoo.com",
          "$1_$2"
        )
      ).toBe("cricket_yahoo.com");
      expect(
        RuleMatcher.checkWildCardMatch(
          "http://*.*.*",
          "http://cricket.yahoo.com",
          "$1_$2_$3"
        )
      ).toBe("cricket_yahoo_com");
      expect(
        RuleMatcher.checkWildCardMatch(
          "*?qp1=*&qp2=*",
          "http://requestly.in?qp1=web&qp2=library",
          "http://$2.requestly.in/$3service"
        )
      ).toBe("http://web.requestly.in/libraryservice");
    });
  });

  describe("#matchValueForPredefinedFunctions ", function () {
    it("should return original value when value is falsy", function () {
      expect(RuleMatcher.matchValueForPredefinedFunctions("", {})).toBe("");
      expect(RuleMatcher.matchValueForPredefinedFunctions(null, {})).toBe(null);
    });
  });

  describe("#matchUrlWithRulePairs", function () {
    it("should execute multiple pairs of a rule", function () {
      var r = getRedirectRule(),
        pairs = [];

      pairs.push(
        {
          source: {
            key: RQ.RULE_KEYS.URL,
            operator: RQ.RULE_OPERATORS.EQUALS,
            value: URL_SOURCES.GOOGLE,
          },
          destination: URL_SOURCES.YAHOO,
        },
        {
          source: {
            key: RQ.RULE_KEYS.URL,
            operator: RQ.RULE_OPERATORS.EQUALS,
            value: URL_SOURCES.DROPBOX,
          },
          destination: URL_SOURCES.QUORA,
        },
        {
          source: {
            key: RQ.RULE_KEYS.URL,
            operator: RQ.RULE_OPERATORS.CONTAINS,
            value: KEYWORDS.YAHOO,
          },
          destination: URL_SOURCES.FACEBOOK,
        }
      );

      r.pairs = pairs;

      expect(
        RuleMatcher.matchUrlWithRulePairs(
          r.pairs,
          URL_SOURCES.GOOGLE,
          requestDetails
        )
      ).toBe(URL_SOURCES.FACEBOOK);
    });
  });

  describe("match source filters", function () {
    const sourceFilters = {
      [RQ.RULE_SOURCE_FILTER_TYPES.PAGE_URL]: [
        { operator: RQ.RULE_OPERATORS.CONTAINS, value: KEYWORDS.EXAMPLE },
      ],
      [RQ.RULE_SOURCE_FILTER_TYPES.RESOURCE_TYPE]: ["script", "stylesheet"],
      [RQ.RULE_SOURCE_FILTER_TYPES.REQUEST_METHOD]: ["GET", "POST"],
    };

    describe("#matchPageUrlFilter", function () {
      const requestDetails = { tabId: 123 };

      it("should return true if page url filter is satisfied", function () {
        const pageUrlFilter =
          sourceFilters[RQ.RULE_SOURCE_FILTER_TYPES.PAGE_URL][0];

        spyOn(window.tabService, "getTabUrl").andReturn(URL_SOURCES.EXAMPLE);
        expect(
          RuleMatcher.matchPageUrlFilter(pageUrlFilter, requestDetails)
        ).toBeTruthy();
      });

      it("should return false if page url filter is not satisfied", function () {
        const pageUrlFilter =
          sourceFilters[RQ.RULE_SOURCE_FILTER_TYPES.PAGE_URL][0];

        spyOn(window.tabService, "getTabUrl").andReturn(URL_SOURCES.GOOGLE);
        expect(
          RuleMatcher.matchPageUrlFilter(pageUrlFilter, requestDetails)
        ).toBeFalsy();
      });
    });

    describe("#matchRequestWithRuleSourceFilters", function () {
      it("should return true only if all source filters are satisfied", function () {
        const requestDetails = {
          tabId: 123,
          method: "GET",
          type: "script",
        };

        spyOn(window.tabService, "getTabUrl").andReturn(URL_SOURCES.EXAMPLE);
        expect(
          RuleMatcher.matchRequestWithRuleSourceFilters(
            sourceFilters,
            requestDetails
          )
        ).toBeTruthy();
      });

      it("should return false if pageUrl filter is not satisfied", function () {
        const requestDetails = {
          tabId: 123,
          method: "GET",
          type: "script",
        };

        spyOn(window.tabService, "getTabUrl").andReturn(URL_SOURCES.GOOGLE);
        expect(
          RuleMatcher.matchRequestWithRuleSourceFilters(
            sourceFilters,
            requestDetails
          )
        ).toBeFalsy();
      });

      it("RQLY-61: should handle pageUrl has object has value instead of array", () => {
        const requestDetails = { tabId: 123 };
        const allFilters = {
          [RQ.RULE_SOURCE_FILTER_TYPES.PAGE_URL]: {
            operator: RQ.RULE_OPERATORS.CONTAINS,
            value: KEYWORDS.EXAMPLE,
          },
        };
        spyOn(window.tabService, "getTabUrl").andReturn(URL_SOURCES.EXAMPLE);
        expect(
          RuleMatcher.matchRequestWithRuleSourceFilters(
            allFilters,
            requestDetails
          )
        ).toBeTruthy();
      });

      it("should return true if sourceFilters are passed as array and all are satisfied", () => {
        const requestDetails = { tabId: 123, method: "POST", type: "script" };
        const allFilters = [
          {
            [RQ.RULE_SOURCE_FILTER_TYPES.RESOURCE_TYPE]: ["script"],
          },
          {
            [RQ.RULE_SOURCE_FILTER_TYPES.PAGE_URL]: [
              {
                operator: RQ.RULE_OPERATORS.CONTAINS,
                value: KEYWORDS.EXAMPLE,
              },
            ],
            [RQ.RULE_SOURCE_FILTER_TYPES.REQUEST_METHOD]: ["POST"],
          },
        ];
        spyOn(window.tabService, "getTabUrl").andReturn(URL_SOURCES.EXAMPLE);
        expect(
          RuleMatcher.matchRequestWithRuleSourceFilters(
            allFilters,
            requestDetails
          )
        ).toBeTruthy();
      });

      it("should return false if sourceFilters are passed as array and all are not satisfied", () => {
        const requestDetails = { tabId: 123, method: "POST", type: "script" };
        const allFilters = [
          {
            [RQ.RULE_SOURCE_FILTER_TYPES.RESOURCE_TYPE]: ["stylesheet"],
          },
          {
            [RQ.RULE_SOURCE_FILTER_TYPES.PAGE_URL]: [
              {
                operator: RQ.RULE_OPERATORS.CONTAINS,
                value: KEYWORDS.EXAMPLE,
              },
            ],
            [RQ.RULE_SOURCE_FILTER_TYPES.REQUEST_METHOD]: ["POST"],
          },
        ];
        spyOn(window.tabService, "getTabUrl").andReturn(URL_SOURCES.EXAMPLE);
        expect(
          RuleMatcher.matchRequestWithRuleSourceFilters(
            allFilters,
            requestDetails
          )
        ).toBeFalsy();
      });

      it("should return false if request method filter is not satisfied", function () {
        const requestDetails = {
          tabId: 123,
          method: "OPTIONS",
          type: "script",
        };

        spyOn(window.tabService, "getTabUrl").andReturn(URL_SOURCES.EXAMPLE);
        expect(
          RuleMatcher.matchRequestWithRuleSourceFilters(
            sourceFilters,
            requestDetails
          )
        ).toBeFalsy();
      });

      it("should return false if request type filter is not satisfied", function () {
        const requestDetails = {
          tabId: 123,
          method: "GET",
          type: "xmlhttprequest",
        };

        spyOn(window.tabService, "getTabUrl").andReturn(URL_SOURCES.EXAMPLE);
        expect(
          RuleMatcher.matchRequestWithRuleSourceFilters(
            sourceFilters,
            requestDetails
          )
        ).toBeFalsy();
      });
    });
  });
});
