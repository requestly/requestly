describe("Requestly Background Service - ", function () {
  let headersRule,
    redirectRule,
    replaceRule,
    userAgentRule,
    queryParamsRule,
    delayRequestRule,
    sourceFilters = {
      [RQ.RULE_SOURCE_FILTER_TYPES.PAGE_URL]: [{ operator: RQ.RULE_OPERATORS.CONTAINS, value: KEYWORDS.EXAMPLE }],
      [RQ.RULE_SOURCE_FILTER_TYPES.RESOURCE_TYPE]: ["xmlhttprequest"],
      [RQ.RULE_SOURCE_FILTER_TYPES.REQUEST_METHOD]: ["GET", "POST"],
    },
    requestDetails = {
      tabId: 123,
      method: "GET",
      type: "xmlhttprequest",
    };

  describe("#BG.Methods.modifyHeaders", function () {
    beforeEach(function () {
      headersRule = getHeadersRuleV1();
      userAgentRule = getUserAgentRule();
      StorageService.getInstance({}, RQ);
    });

    afterEach(function () {
      headersRule = null;
      userAgentRule = null;
      RQ.StorageService.records = [];
    });

    it("should return null when no header is modified", function () {
      RQ.StorageService.records.push(headersRule);

      // Different Headers Target (Rule contains Request Headers)
      expect(
        BG.Methods.modifyHeaders([], RQ.HEADERS_TARGET.RESPONSE, {
          url: URL_SOURCES.FACEBOOK,
        })
      ).toBeNull();
    });

    it("should return null when there are no Active Rules", function () {
      headersRule.status = RQ.RULE_STATUS.INACTIVE;

      RQ.StorageService.records.push(headersRule);
      expect(
        BG.Methods.modifyHeaders([], RQ.HEADERS_TARGET.REQUEST, {
          url: URL_SOURCES.FACEBOOK,
        })
      ).toBeNull();
    });

    it("should return modified Headers Array when header is added", function () {
      RQ.StorageService.records.push(headersRule);

      var modifiedheaders = BG.Methods.modifyHeaders([], RQ.HEADERS_TARGET.REQUEST, { url: URL_SOURCES.FACEBOOK });
      expect(modifiedheaders.length).toEqual(1);
    });

    it("should return modified Headers Array when header is removed", function () {
      var originalHeaders = [
        { name: "Accept-Language", value: "en-us" },
        { name: "Host", value: "example.com" },
        { name: "User-Agent", value: "Chrome" },
      ];

      headersRule.pairs[0]["type"] = RQ.MODIFICATION_TYPES.REMOVE;

      RQ.StorageService.records.push(headersRule);
      var modifiedHeaders = BG.Methods.modifyHeaders(originalHeaders, RQ.HEADERS_TARGET.REQUEST, {
        url: URL_SOURCES.FACEBOOK,
      });
      expect(modifiedHeaders.length).toEqual(2);
    });

    it("should replace PreDefinedFunction with its computed value", function () {
      var pair = headersRule.pairs[0];
      pair.header = "x-requestId";
      pair.value = "rq_rand(2)";

      RQ.StorageService.records.push(headersRule);
      var modifiedHeaders = BG.Methods.modifyHeaders([], RQ.HEADERS_TARGET.REQUEST, { url: URL_SOURCES.FACEBOOK });
      expect(modifiedHeaders.length).toBe(1);
      expect(modifiedHeaders[0]["name"]).toBe("x-requestId");
      expect(/^[0-9]+$/gi.test(modifiedHeaders[0]["value"])).toBe(true);
    });

    it("should override user agent for request from page in case type is mainFrame", function () {
      var pair = userAgentRule.pairs[0],
        sourceUrl = pair.source.value;

      pair.source.requestType = RQ.REQUEST_TYPES.MAIN_FRAME;
      RQ.StorageService.records.push(userAgentRule);

      spyOn(BG.Methods, "getMainFrameUrl").andCallFake(function () {
        return sourceUrl;
      });
      var modifiedHeaders = BG.Methods.modifyHeaders([], RQ.HEADERS_TARGET.REQUEST, { url: sourceUrl + "/request" });
      expect(modifiedHeaders).not.toBeNull();
      expect(modifiedHeaders.length).toBe(1);
      expect(modifiedHeaders[0]["name"]).toBe(RQ.HEADER_NAMES.USER_AGENT);
      expect(modifiedHeaders[0]["value"]).toBe(pair.userAgent);
    });

    it("should not override user agent for request from page in case type is pageRequest", function () {
      var pair = userAgentRule.pairs[0],
        sourceUrl = pair.source.value;

      pair.source.requestType = RQ.REQUEST_TYPES.PAGE_REQUEST;
      RQ.StorageService.records.push(userAgentRule);

      spyOn(BG.Methods, "getMainFrameUrl").andCallFake(function () {
        return sourceUrl;
      });
      var modifiedHeaders = BG.Methods.modifyHeaders([], RQ.HEADERS_TARGET.REQUEST, { url: sourceUrl + "/request" });
      expect(modifiedHeaders).toBeNull();
    });

    it("should modify headers if source filters are satisfied", function () {
      headersRule.pairs[0].source.filters = sourceFilters;
      RQ.StorageService.records.push(headersRule);

      spyOn(window.tabService, "getTabUrl").andReturn(URL_SOURCES.EXAMPLE);

      const modifiedHeaders = BG.Methods.modifyHeaders([], RQ.HEADERS_TARGET.REQUEST, {
        url: URL_SOURCES.FACEBOOK,
        method: "GET",
        type: "xmlhttprequest",
      });
      expect(modifiedHeaders.length).toEqual(1);
    });

    it("should not modify headers if source filters are not satisfied", function () {
      headersRule.pairs[0].source.filters = sourceFilters;
      RQ.StorageService.records.push(headersRule);

      spyOn(window.tabService, "getTabUrl").andReturn(URL_SOURCES.GOOGLE);

      var modifiedHeaders = BG.Methods.modifyHeaders([], RQ.HEADERS_TARGET.REQUEST, {
        url: URL_SOURCES.FACEBOOK,
        ...requestDetails,
      });
      expect(modifiedHeaders).toBeNull();
    });

    // V2 schema rules
    it("should return modified Headers Array when header is added(v2 schema)", function () {
      headersRule = getHeadersRuleV2();
      RQ.StorageService.records.push(headersRule);

      var modifiedheaders = BG.Methods.modifyHeaders([], RQ.HEADERS_TARGET.REQUEST, { url: URL_SOURCES.FACEBOOK });
      const expectedHeaderModification = headersRule.pairs[0].modifications[RQ.HEADERS_TARGET.REQUEST];

      expect(modifiedheaders.length).toEqual(1);
      expect(modifiedheaders).toEqual([
        {
          name: expectedHeaderModification[0].header,
          value: expectedHeaderModification[0].value,
        },
      ]);
    });

    it("should return modified Headers Array when header is removed(v2 schema)", function () {
      var originalHeaders = [
        { name: "Accept-Language", value: "en-us" },
        { name: "Host", value: "example.com" },
        { name: "User-Agent", value: "Chrome" },
      ];

      headersRule = getHeadersRuleV2();
      headersRule.pairs[0].modifications[RQ.HEADERS_TARGET.REQUEST][0]["type"] = RQ.MODIFICATION_TYPES.REMOVE;

      RQ.StorageService.records.push(headersRule);
      var modifiedHeaders = BG.Methods.modifyHeaders(originalHeaders, RQ.HEADERS_TARGET.REQUEST, {
        url: URL_SOURCES.FACEBOOK,
      });

      expect(modifiedHeaders.length).toEqual(2);
      expect(modifiedHeaders).toEqual(originalHeaders.slice(0, 2));
    });

    it("should replace PreDefinedFunction with its computed value(v2 schema)", function () {
      headersRule = getHeadersRuleV2();
      var pair = headersRule.pairs[0];
      pair.modifications[RQ.HEADERS_TARGET.REQUEST][0].header = "x-requestId";
      pair.modifications[RQ.HEADERS_TARGET.REQUEST][0].value = "rq_rand(2)";

      RQ.StorageService.records.push(headersRule);
      var modifiedHeaders = BG.Methods.modifyHeaders([], RQ.HEADERS_TARGET.REQUEST, { url: URL_SOURCES.FACEBOOK });

      expect(modifiedHeaders.length).toBe(1);
      expect(modifiedHeaders[0]["name"]).toBe("x-requestId");
      expect(/^[0-9]+$/gi.test(modifiedHeaders[0]["value"])).toBe(true);
    });

    it("should modify headers if source filters are satisfied(v2 schema)", function () {
      headersRule = getHeadersRuleV2();
      headersRule.pairs[0].source.filters = sourceFilters;
      RQ.StorageService.records.push(headersRule);

      spyOn(window.tabService, "getTabUrl").andReturn(URL_SOURCES.EXAMPLE);

      const modifiedHeaders = BG.Methods.modifyHeaders([], RQ.HEADERS_TARGET.REQUEST, {
        url: URL_SOURCES.FACEBOOK,
        method: "GET",
        type: "xmlhttprequest",
      });

      const expectedHeaderModification = headersRule.pairs[0].modifications[RQ.HEADERS_TARGET.REQUEST];

      expect(modifiedHeaders.length).toEqual(1);
      expect(modifiedHeaders).toEqual([
        {
          name: expectedHeaderModification[0].header,
          value: expectedHeaderModification[0].value,
        },
      ]);
    });

    it("should not modify headers if source filters are not satisfied", function () {
      headersRule = getHeadersRuleV2();
      headersRule.pairs[0].source.filters = sourceFilters;
      RQ.StorageService.records.push(headersRule);

      spyOn(window.tabService, "getTabUrl").andReturn(URL_SOURCES.GOOGLE);

      var modifiedHeaders = BG.Methods.modifyHeaders([], RQ.HEADERS_TARGET.REQUEST, {
        url: URL_SOURCES.FACEBOOK,
        ...requestDetails,
      });

      expect(modifiedHeaders).toBeNull();
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
      BG.Methods.addHeader(originalHeaders, {
        name: "Host",
        value: "requestly.in",
      });
      expect(originalHeaders.length).toBe(4);

      BG.Methods.addHeader(originalHeaders, {
        name: "user-agent",
        value: "Firefox",
      });
      expect(originalHeaders.length).toBe(5);
    });

    it("removeHeader should remove header when header is present", function () {
      BG.Methods.removeHeader(originalHeaders, "Host");
      expect(originalHeaders.length).toBe(2);

      // Note we did not add - between User and Agent so it should not delete this header
      BG.Methods.removeHeader(originalHeaders, "UserAgent");
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

      BG.Methods.removeHeader(originalHeaders, "Set-Cookie");
      expect(containsHeader(originalHeaders, "Set-Cookie")).toBe(false);

      BG.Methods.removeHeader(originalHeaders, "Cache-Control");
      expect(containsHeader(originalHeaders, "Cache-Control")).toBe(false);
    });

    it("modifyHeader should modify header only when header is present", function () {
      BG.Methods.modifyHeaderIfExists(originalHeaders, {
        name: "Host",
        value: "requestly.in",
      });
      expect(originalHeaders.length).toBe(3);
      expect(originalHeaders[1]["value"]).toBe("requestly.in");

      // Should not do anything
      BG.Methods.modifyHeaderIfExists(originalHeaders, {
        name: "cookie",
        value: "session_id",
      });
      expect(originalHeaders.length).toBe(3);
    });

    it("replaceHeader should modify header when header is present otherwise should add header", function () {
      BG.Methods.replaceHeader(originalHeaders, {
        name: "Host",
        value: "requestly.in",
      });
      expect(originalHeaders.length).toBe(3);
      expect(originalHeaders[2]["value"]).toBe("requestly.in");

      // Should Insert new header when header is not present
      BG.Methods.replaceHeader(originalHeaders, {
        name: "cookie",
        value: "session_id",
      });
      expect(originalHeaders.length).toBe(4);
    });
  });

  describe("#BG.Methods.modifyUrl", function () {
    beforeEach(function () {
      redirectRule = getRedirectRule();
      replaceRule = getReplaceRule();
      queryParamsRule = getQueryParamsRule();
      RQ.StorageService.records = [];
    });

    afterEach(function () {
      redirectRule = null;
      replaceRule = null;
      queryParamsRule = null;
    });

    describe("should update preDefinedFunction rq_rand value", function () {
      it("Redirect Rule", function () {
        var pair = redirectRule.pairs[0];
        pair["destination"] = "http://www.example.com?q=rq_rand(0)";
        RQ.StorageService.records.push(redirectRule);

        expect(
          BG.Methods.modifyUrl({
            url: URL_SOURCES.GOOGLE,
            method: "GET",
          })["redirectUrl"]
        ).toBe("http://www.example.com?q=1");
      });

      it("Replace Rule", function () {
        var pair = replaceRule.pairs[0];
        pair["to"] = "fb_rq_rand(0)";
        RQ.StorageService.records.push(replaceRule);

        expect(
          BG.Methods.modifyUrl({
            url: URL_SOURCES.GOOGLE,
            method: "GET",
          })["redirectUrl"]
        ).toBe("http://www.fb_1.com");
      });
    });

    describe("should update preDefinedFunction rq_encode value", function () {
      it("Redirect Rule", function () {
        var pair = redirectRule.pairs[0];
        pair["destination"] = "http://www.example.com/?password=rq_encode(P@$$W0rD)&val=123#rq_encode(my#string)";
        RQ.StorageService.records.push(redirectRule);

        expect(
          BG.Methods.modifyUrl({
            url: URL_SOURCES.GOOGLE,
            method: "GET",
          })["redirectUrl"]
        ).toBe("http://www.example.com/?password=P%40%24%24W0rD&val=123#my%23string");
      });

      it("Query parameters Rule", function () {
        var pair = queryParamsRule.pairs[0],
          modification1 = pair["modifications"][0],
          modification2 = pair["modifications"][1];

        modification1["param"] = "u";
        modification1["value"] = "rq_encode(user+test@example.com)";

        modification2["param"] = "v";
        modification2["value"] = "prq_encode(@)q";

        RQ.StorageService.records.push(queryParamsRule);

        expect(
          BG.Methods.modifyUrl({
            url: URL_SOURCES.GOOGLE,
            method: "GET",
          })["redirectUrl"]
        ).toBe(URL_SOURCES.GOOGLE + "?u=user%2Btest%40example.com&v=p%40q");
      });
    });

    it("should execute all matched rules for the same request", function () {
      queryParamsRule.pairs[0].source = {
        key: RQ.RULE_KEYS.URL,
        operator: RQ.RULE_OPERATORS.EQUALS,
        value: URL_SOURCES.FACEBOOK,
      };

      RQ.StorageService.records.push(redirectRule, queryParamsRule);

      expect(
        BG.Methods.modifyUrl({
          url: URL_SOURCES.DROPBOX,
          requestId: 200,
          method: "GET",
        })["redirectUrl"]
      ).toBe(URL_SOURCES.FACEBOOK + "?a=1&b=2");
    });
  });

  describe("#BG.Methods.applyReplaceRule", function () {
    beforeEach(function () {
      replaceRule = getReplaceRule();
    });

    afterEach(function () {
      replaceRule = null;
    });

    it("should replace query parameters with ? in beginning (Issue: #86)", function () {
      expect(BG.Methods.applyReplaceRule(replaceRule, URL_SOURCES.DROPBOX + "?dl=0", requestDetails)).toBe(
        URL_SOURCES.DROPBOX + "?dl=1"
      );

      expect(BG.Methods.applyReplaceRule(replaceRule, URL_SOURCES.REQUESTLY + "?dl=0", requestDetails)).toBeNull();
    });

    it("should match Url source before replacing matched string in Url", function () {
      // Case When source does not match with Url
      expect(BG.Methods.applyReplaceRule(replaceRule, URL_SOURCES.YAHOO + "?q=1", requestDetails)).toBeNull();

      // Source matches with Url
      expect(BG.Methods.applyReplaceRule(replaceRule, URL_SOURCES.EXAMPLE + "?q=1", requestDetails)).toBe(
        URL_SOURCES.EXAMPLE
      );
    });

    it('should replace when "pair.from" is valid regex', function () {
      expect(BG.Methods.applyReplaceRule(replaceRule, URL_SOURCES.GOOGLE, requestDetails)).toBe(URL_SOURCES.FACEBOOK);
    });

    it("should execute multiple pairs in same rule", function () {
      var pairs = [];

      pairs.push(
        {
          from: "?dl=1",
          to: "?dl=2",
          source: {
            key: RQ.RULE_KEYS.URL,
            operator: RQ.RULE_OPERATORS.CONTAINS,
            value: KEYWORDS.DROPBOX,
          },
        },
        {
          from: "?dl=3",
          to: "?dl=4",
          source: {
            key: RQ.RULE_KEYS.URL,
            operator: RQ.RULE_OPERATORS.CONTAINS,
            value: KEYWORDS.DROPBOX,
          },
        },
        {
          from: "?dl=2",
          to: "?dl=3",
          source: {
            key: RQ.RULE_KEYS.URL,
            operator: RQ.RULE_OPERATORS.CONTAINS,
            value: KEYWORDS.DROPBOX,
          },
        }
      );

      replaceRule.pairs = pairs;

      expect(BG.Methods.applyReplaceRule(replaceRule, URL_SOURCES.DROPBOX + "?dl=1", requestDetails)).toBe(
        URL_SOURCES.DROPBOX + "?dl=3"
      );
    });

    it("should apply replace rule if source filters are satisfied", function () {
      replaceRule.pairs[1].source.filters = sourceFilters;

      spyOn(window.tabService, "getTabUrl").andReturn(URL_SOURCES.EXAMPLE);
      expect(BG.Methods.applyReplaceRule(replaceRule, URL_SOURCES.DROPBOX + "?dl=0", requestDetails)).toBe(
        URL_SOURCES.DROPBOX + "?dl=1"
      );
    });

    it("should not apply replace rule if source filters are not satisfied", function () {
      replaceRule.pairs[1].source.filters = sourceFilters;

      spyOn(window.tabService, "getTabUrl").andReturn(URL_SOURCES.GOOGLE);
      expect(BG.Methods.applyReplaceRule(replaceRule, URL_SOURCES.DROPBOX + "?dl=0", requestDetails)).toBeNull();
    });
  });

  describe("#BG.Methods.getEnabledRules", function () {
    var enabledRule, disabledRule, enabledGroup, disabledGroup;

    beforeEach(function () {
      RQ.StorageService.records = [];
      enabledRule = getBaseRule({ status: RQ.RULE_STATUS.ACTIVE });
      disabledRule = getBaseRule({ status: RQ.RULE_STATUS.INACTIVE });
      enabledGroup = getGroup({
        id: "enabledGroup",
        status: RQ.GROUP_STATUS.ACTIVE,
      });
      disabledGroup = getGroup({
        id: "disabledGroup",
        status: RQ.GROUP_STATUS.INACTIVE,
      });
    });

    it("should return rules which are active and do not belong to any group", function () {
      RQ.StorageService.records.push(enabledRule, disabledRule);

      var enabledRules = BG.Methods.getEnabledRules();
      expect(enabledRules.length).toBe(1);
    });

    it("should return rules which are active and their container groups are also active", function () {
      enabledRule.groupId = enabledGroup.id;
      RQ.StorageService.records.push(enabledRule, enabledGroup);

      var enabledRules = BG.Methods.getEnabledRules();
      expect(enabledRules.length).toBe(1);
    });

    it("should not return rules which are active but their container groups are not active", function () {
      enabledRule.groupId = disabledGroup.id;
      RQ.StorageService.records.push(enabledRule, disabledGroup);

      var enabledRules = BG.Methods.getEnabledRules();
      expect(enabledRules.length).toBe(0);
    });
  });

  describe("#applyQueryParamRule", function () {
    beforeEach(function () {
      queryParamsRule = getQueryParamsRule();
    });

    it("should be able to add query param", function () {
      expect(BG.Methods.applyQueryParamRule(queryParamsRule, URL_SOURCES.EXAMPLE, requestDetails)).toBe(
        URL_SOURCES.EXAMPLE + "?a=1&b=2"
      );
    });

    it("should apply query param rule if source filters are satisfied", function () {
      queryParamsRule.pairs[0].source.filters = sourceFilters;

      spyOn(window.tabService, "getTabUrl").andReturn(URL_SOURCES.EXAMPLE);
      expect(BG.Methods.applyQueryParamRule(queryParamsRule, URL_SOURCES.EXAMPLE, requestDetails)).toBe(
        URL_SOURCES.EXAMPLE + "?a=1&b=2"
      );
    });

    it("should not apply query param rule if source filters are not satisfied", function () {
      queryParamsRule.pairs[0].source.filters = sourceFilters;

      spyOn(window.tabService, "getTabUrl").andReturn(URL_SOURCES.GOOGLE);
      expect(BG.Methods.applyQueryParamRule(queryParamsRule, URL_SOURCES.EXAMPLE, requestDetails)).toBeNull();
    });
  });

  describe("#applyDelayRequestRule", function () {
    beforeEach(function () {
      delayRequestRule = getDelayRequestRule();
    });
    const delayParam = `${RQ.DELAY_REQUEST_CONSTANTS.DELAY_PARAM_NAME}=${RQ.DELAY_REQUEST_CONSTANTS.DELAY_PARAM_VALUE}`;
    it("should be able to return the delay API URL using contains match", function () {
      expect(BG.Methods.applyDelayRequestRule(delayRequestRule, URL_SOURCES.EXAMPLE, requestDetails)).toBe(
        `${URL_SOURCES.EXAMPLE}?${delayParam}`
      );
    });

    it("should be able to return the delay API URL using equals match", function () {
      expect(BG.Methods.applyDelayRequestRule(delayRequestRule, URL_SOURCES.DROPBOX, requestDetails)).toBe(
        `${URL_SOURCES.DROPBOX}?${delayParam}`
      );
    });

    it("should be able to return the delay API URL using by decoding predefined rand func", function () {
      expect(
        BG.Methods.applyDelayRequestRule(delayRequestRule, URL_SOURCES.EXAMPLE + "?r=rq_rand(0)#check", requestDetails)
      ).toBe(`${URL_SOURCES.EXAMPLE}?r=1&${delayParam}#check`);
    });

    it("should be able to return the delay API URL using by decoding predefined increment func", function () {
      expect(
        BG.Methods.applyDelayRequestRule(delayRequestRule, URL_SOURCES.EXAMPLE + "?r=rq_increment(5,2)", requestDetails)
      ).toBe(`${URL_SOURCES.EXAMPLE}?r=7&${delayParam}`);
    });

    it("should be able to return the delay API URL containing hash", function () {
      expect(
        BG.Methods.applyDelayRequestRule(
          delayRequestRule,
          URL_SOURCES.EXAMPLE + "?a=2&b=3&c=check#some-testingstring",
          requestDetails
        )
      ).toBe(`${URL_SOURCES.EXAMPLE}?a=2&b=3&c=check&${delayParam}#some-testingstring`);
    });

    it("should be able to return the server-side delay API URL containing hash string and delay=3000ms", function () {
      const delay = delayRequestRule.pairs[3].delay;

      expect(
        BG.Methods.applyDelayRequestRule(delayRequestRule, URL_SOURCES.FACEBOOK + "?b=3&c=check#ServerSide", {
          method: "GET",
          type: "image",
        })
      ).toBe(`${RQ.CONSTANTS.DELAY_API_URL}${delay}/${URL_SOURCES.FACEBOOK}?b=3&c=check#ServerSide`);
    });

    it("should apply delay rule if source filters are satisfied", function () {
      delayRequestRule.pairs[0].source.filters = sourceFilters;

      spyOn(window.tabService, "getTabUrl").andReturn(URL_SOURCES.EXAMPLE);
      expect(BG.Methods.applyDelayRequestRule(delayRequestRule, URL_SOURCES.EXAMPLE, requestDetails)).toBe(
        `${URL_SOURCES.EXAMPLE}?${delayParam}`
      );
    });

    it("should not apply query param rule if source filters are not satisfied", function () {
      delayRequestRule.pairs[0].source.filters = sourceFilters;
      const delay = delayRequestRule.pairs[0].delay;

      spyOn(window.tabService, "getTabUrl").andReturn(URL_SOURCES.GOOGLE);
      expect(BG.Methods.applyDelayRequestRule(delayRequestRule, URL_SOURCES.EXAMPLE, requestDetails)).toBeNull();
    });
  });

  describe("#applyQueryParamModifications", function () {
    beforeEach(function () {
      queryParamsRule = getQueryParamsRule();
    });

    it("should be able to add query param", function () {
      expect(
        BG.Methods.applyQueryParamModifications(queryParamsRule.pairs[0]["modifications"], URL_SOURCES.EXAMPLE)
      ).toBe(URL_SOURCES.EXAMPLE + "?a=1&b=2");
    });

    it("should overwrite the parameter is present", function () {
      expect(
        BG.Methods.applyQueryParamModifications(queryParamsRule.pairs[0]["modifications"], URL_SOURCES.EXAMPLE + "?a=3")
      ).toBe(URL_SOURCES.EXAMPLE + "?a=1&b=2");
    });

    it("should be able to remove the param", function () {
      queryParamsRule.pairs[0]["modifications"][0]["type"] = RQ.MODIFICATION_TYPES.REMOVE;
      expect(
        BG.Methods.applyQueryParamModifications(queryParamsRule.pairs[0]["modifications"], URL_SOURCES.EXAMPLE + "?a=1")
      ).toBe(URL_SOURCES.EXAMPLE + "?b=2");
    });

    it("add and remove param should not create any effect", function () {
      var modifications = queryParamsRule.pairs[0]["modifications"];

      modifications[0]["type"] = RQ.MODIFICATION_TYPES.ADD;
      modifications[0]["param"] = "a";

      modifications[1]["type"] = RQ.MODIFICATION_TYPES.REMOVE;
      modifications[1]["param"] = "a";

      expect(BG.Methods.applyQueryParamModifications(modifications, URL_SOURCES.EXAMPLE)).toBe(URL_SOURCES.EXAMPLE);
      expect(BG.Methods.applyQueryParamModifications(modifications, URL_SOURCES.EXAMPLE + "?b=2")).toBe(
        URL_SOURCES.EXAMPLE + "?b=2"
      );
      expect(BG.Methods.applyQueryParamModifications(modifications, URL_SOURCES.EXAMPLE + "#hash")).toBe(
        URL_SOURCES.EXAMPLE + "#hash"
      );
    });

    it("removeAll and add should add only one param", function () {
      var modifications = queryParamsRule.pairs[0]["modifications"];

      modifications[0]["type"] = RQ.MODIFICATION_TYPES.REMOVE_ALL;

      modifications[1]["type"] = RQ.MODIFICATION_TYPES.ADD;
      modifications[1]["param"] = "a";
      modifications[1]["value"] = 1;

      expect(BG.Methods.applyQueryParamModifications(modifications, URL_SOURCES.EXAMPLE)).toBe(
        URL_SOURCES.EXAMPLE + "?a=1"
      );
      expect(BG.Methods.applyQueryParamModifications(modifications, URL_SOURCES.EXAMPLE + "?b=2")).toBe(
        URL_SOURCES.EXAMPLE + "?a=1"
      );
      expect(BG.Methods.applyQueryParamModifications(modifications, URL_SOURCES.EXAMPLE + "#hash")).toBe(
        URL_SOURCES.EXAMPLE + "?a=1#hash"
      );
    });

    it("adding multiple modifications with special characters in values", function () {
      var modifications = queryParamsRule.pairs[0]["modifications"];

      modifications[0]["type"] = RQ.MODIFICATION_TYPES.ADD;
      modifications[0]["param"] = "q";
      modifications[0]["value"] = "@";

      modifications[1]["type"] = RQ.MODIFICATION_TYPES.ADD;
      modifications[1]["param"] = "a";
      modifications[1]["value"] = "1";

      expect(BG.Methods.applyQueryParamModifications(modifications, URL_SOURCES.EXAMPLE)).toBe(
        URL_SOURCES.EXAMPLE + "?q=@&a=1"
      );
    });
  });

  describe("#applyQueryParamModification", function () {
    it("should remove param only when exists in params map", function () {
      const url = URL_SOURCES.EXAMPLE;
      const modification = {
        type: RQ.MODIFICATION_TYPES.REMOVE,
        param: "utm_source",
      };

      expect(BG.Methods.applyQueryParamModification(modification, url)).toBe(url);
      expect(BG.Methods.applyQueryParamModification(modification, url + "?utm_source=email")).toBe(url);
      expect(BG.Methods.applyQueryParamModification(modification, url + "?utm_param=facebook")).toBe(
        url + "?utm_param=facebook"
      );
    });
  });

  describe("Request", function () {
    beforeEach(function () {
      BG.modifiedRequestsPool.reset();
      RQ.StorageService.records = [];
    });

    it("should not be redirected again with Redirect Rule", function () {
      BG.modifiedRequestsPool.enQueue(100);

      expect(
        BG.Methods.modifyUrl({
          url: URL_SOURCES.EXAMPLE,
          requestId: 100,
          method: "GET",
        })
      ).toBeUndefined();
    });

    it("should not redirect again if request has been redirected once", function () {
      var redirectRule = getRedirectRule();
      var queryParamRule = getQueryParamsRule();

      var qpPair = queryParamRule.pairs[0];
      qpPair.source = {
        key: RQ.RULE_KEYS.URL,
        operator: RQ.RULE_OPERATORS.EQUALS,
        value: URL_SOURCES.YAHOO,
      };

      RQ.StorageService.records.push(redirectRule, queryParamRule);

      expect(
        BG.Methods.modifyUrl({
          url: URL_SOURCES.DROPBOX,
          requestId: 200,
          method: "GET",
        })["redirectUrl"]
      ).toBe(URL_SOURCES.FACEBOOK);
      expect(
        BG.Methods.modifyUrl({
          url: URL_SOURCES.FACEBOOK,
          requestId: 200,
          method: "GET",
        })
      ).toBeUndefined();
    });
  });

  describe("#BG.Methods.getMatchingRulePairs", function () {
    it("should return empty rules when extension is deactivated", function () {
      BG.statusSettings.isExtensionEnabled = false;
      expect(BG.Methods.getMatchingRulePairs("www.example.com", RQ.RULE_TYPES.SCRIPT, requestDetails).length).toBe(0);
      BG.statusSettings.isExtensionEnabled = true;
    });

    // ToDo: Add More Test Cases for getMatchingRulePairs
  });

  describe("#appendExecutionLog", function () {
    const originalNumberExecutionLogsLimit = RQ.CONSTANTS.LIMITS.NUMBER_EXECUTION_LOGS;
    beforeEach(function () {
      RQ.StorageService.records = [];
    });
    afterEach(function () {
      RQ.CONSTANTS.LIMITS.NUMBER_EXECUTION_LOGS = originalNumberExecutionLogsLimit;
    });

    it("should append new log directly into logs array when its size is not full", () => {
      RQ.CONSTANTS.LIMITS.NUMBER_EXECUTION_LOGS = 5;

      const existingLogs = Array.apply(null, Array(3)).map(() => getExecutionLogObject());

      const lastExistingLog = existingLogs[existingLogs.length - 1];

      const newLogs = appendExecutionLog(existingLogs, getExecutionLogObject());
      const lastNewLog = newLogs[newLogs.length - 1];

      expect(newLogs.length).toBe(4);
      expect(existingLogs.length).toBe(3);
      expect(lastNewLog.id).not.toBe(lastExistingLog.id);
    });

    it("should append new log into array after removing 1st element when its size is full", () => {
      RQ.CONSTANTS.LIMITS.NUMBER_EXECUTION_LOGS = 3;

      const existingLogs = Array.apply(null, Array(RQ.CONSTANTS.LIMITS.NUMBER_EXECUTION_LOGS)).map(() =>
        getExecutionLogObject()
      );

      const lastExistingLog = existingLogs[existingLogs.length - 1];
      const firstExistingLog = existingLogs[0];

      const newLogs = appendExecutionLog(existingLogs, getExecutionLogObject());
      const lastNewLog = newLogs[newLogs.length - 1];
      const firstNewLog = newLogs[0];

      expect(newLogs.length).toBe(RQ.CONSTANTS.LIMITS.NUMBER_EXECUTION_LOGS);
      expect(existingLogs.length).toBe(RQ.CONSTANTS.LIMITS.NUMBER_EXECUTION_LOGS);
      expect(lastNewLog.id).not.toBe(lastExistingLog.id);
      expect(firstNewLog.id).not.toBe(firstExistingLog.id);
    });

    it("should append new log into array when array size is 0", () => {
      const initialLogsSize = 0;

      const existingLogs = Array.apply(null, Array(initialLogsSize)).map(() => getExecutionLogObject());

      const newLogs = appendExecutionLog(existingLogs, getExecutionLogObject());
      const lastNewLog = newLogs[newLogs.length - 1];
      const firstNewLog = newLogs[0];

      expect(existingLogs.length).toBe(initialLogsSize);
      expect(newLogs.length).toBe(initialLogsSize + 1);
      expect(firstNewLog.id).toBe(lastNewLog.id);
    });

    it("should create new array when existingLogs is undefined", () => {
      RQ.CONSTANTS.LIMITS.NUMBER_EXECUTION_LOGS = 3;

      const existingLogs = undefined;
      expect(existingLogs).toBeUndefined();

      const newLogs = appendExecutionLog(existingLogs, getExecutionLogObject());
      const lastNewLog = newLogs[newLogs.length - 1];
      const firstNewLog = newLogs[0];

      expect(newLogs.length).toBe(1);
      expect(firstNewLog.id).toBe(lastNewLog.id);
    });
  });

  describe("#buildExecutionLogObject", () => {
    it("should contain all the objects in the execution object", () => {
      const requestDetails = {
        tabId: 123,
        method: "GET",
        type: "xmlhttprequest",
        url: "http://example.com",
        timestamp: Date.now(),
      };

      const executionLogObject = buildExecutionLogObject({
        ruleName: "test",
        requestDetails,
        modifications: "",
      });

      const executionLogObjectKeys = Object.keys(executionLogObject);

      expect(executionLogObjectKeys).toContain("id");
      expect(executionLogObjectKeys).toContain("requestMethod");
      expect(executionLogObjectKeys).toContain("timestamp");
      expect(executionLogObjectKeys).toContain("url");
      expect(executionLogObjectKeys).toContain("requestType");
      expect(executionLogObjectKeys).toContain("ruleName");
      expect(executionLogObjectKeys).toContain("modification");
    });
  });

  describe("#getSessionRecordingConfig", () => {
    it("should return null if config does not exist", async () => {
      spyOn(RQ.StorageService, "getRecord").andReturn(Promise.resolve(undefined));

      waits(100); // allow below async function to return
      const config = await BG.Methods.getSessionRecordingConfig("https://example.com");

      runs(() => {
        expect(config).toBeNull();
      });
    });

    it("should return config if config exists and url matches", async () => {
      const testConfig = {
        pageSources: [
          {
            key: "Url",
            operator: "Contains",
            value: "example",
          },
        ],
      };
      spyOn(RQ.StorageService, "getRecord").andReturn(Promise.resolve(testConfig));

      waits(100); // allow below async function to return
      const config = await BG.Methods.getSessionRecordingConfig("https://example.com");

      runs(() => {
        expect(config).toEqual(testConfig);
      });
    });

    it("should return null if config exists and url does not match", async () => {
      const testConfig = {
        pageSources: [
          {
            key: "Url",
            operator: "Contains",
            value: "example1",
          },
        ],
      };
      spyOn(RQ.StorageService, "getRecord").andReturn(Promise.resolve(testConfig));

      waits(100); // allow below async function to return
      const config = await BG.Methods.getSessionRecordingConfig("https://example.com");

      runs(() => {
        expect(config).toBeNull();
      });
    });
  });
});
