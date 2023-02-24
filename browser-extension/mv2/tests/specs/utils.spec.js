describe("Utility functions", function () {
  it("should have Regex format", function () {
    expect(RQ.Utils.regexFormat).toBe("^/(.+)/(|i|g|ig|gi)$");
  });

  it("should convert given string to regex", function () {
    expect(RQ.Utils.toRegex("/test/i") instanceof RegExp).toBe(true);
    expect(RQ.Utils.toRegex("test")).toBeNull();
  });

  it("should validate Url", function () {
    expect(RQ.Utils.isValidUrl("google.com")).toBe(false);
    expect(RQ.Utils.isValidUrl("http://www.example.com")).toBe(true);
    expect(RQ.Utils.isValidUrl("http.example.com")).toBe(false);
    expect(RQ.Utils.isValidUrl('javascript:alert("works")')).toBe(true);
  });

  it("should remove last part", function () {
    expect(RQ.Utils.removeLastPart("sharedList/1455023747986/19", "/")).toBe(
      "sharedList/1455023747986"
    );
    expect(RQ.Utils.removeLastPart("a-b-c", "-")).toBe("a-b");
    expect(RQ.Utils.removeLastPart("1-2-3", "|")).toBe("1-2-3");
    expect(RQ.Utils.removeLastPart("abc", "b")).toBe("a");
  });
});

describe("#removeLastPart", function () {
  it("should validate removeLastPart when seperator is not present", function () {
    const inputString = "www.requestly.com";
    const seperator = "/";
    const expectedOutputString = "www.requestly.com";
    expect(RQ.Utils.removeLastPart(inputString, seperator)).toBe(
      expectedOutputString
    );
  });

  it("should validate removeLastPart when seperator is present", function () {
    const inputString = "www.requestly.com/mozillaextension";
    const seperator = "/";
    const expectedOutputString = "www.requestly.com";
    expect(RQ.Utils.removeLastPart(inputString, seperator)).toBe(
      expectedOutputString
    );
  });

  it("should validate removeLastPart when seperator is null", function () {
    const inputString = "www.requestly.com/mozillaextension";
    const seperator = null;
    const expectedOutputString = "www.requestly.com/mozillaextension";
    expect(RQ.Utils.removeLastPart(inputString, seperator)).toBe(
      expectedOutputString
    );
  });

  it("should validate removeLastPart when input and seperator are null", function () {
    const inputString = null;
    const seperator = null;
    const expectedOutputString = "";
    expect(RQ.Utils.removeLastPart(inputString, seperator)).toBe("");
  });

  it("should validate removeLastPart when seperator is undefined", function () {
    const inputString = "www.requestly.com/mozillaextension";
    const seperator = undefined;
    const expectedOutputString = "www.requestly.com/mozillaextension";
    expect(RQ.Utils.removeLastPart(inputString, seperator)).toBe(
      expectedOutputString
    );
  });

  it("should validate removeLastPart when input and seperator are undefined", function () {
    const inputString = undefined;
    const seperator = undefined;
    const expectedOutputString = "";
    expect(RQ.Utils.removeLastPart(inputString, seperator)).toBe(
      expectedOutputString
    );
  });
});

describe("Extract Url components", function () {
  var url = "http://localhost:7000/web/index.html?a=1#users";

  it("should return unchanged url when asked for Url", function () {
    expect(RQ.Utils.extractUrlComponent(url, RQ.URL_COMPONENTS.URL)).toBe(url);
  });

  it("should extract host from url", function () {
    expect(RQ.Utils.extractUrlComponent(url, RQ.URL_COMPONENTS.HOST)).toBe(
      "localhost:7000"
    );
  });

  it("should extract path from url", function () {
    expect(RQ.Utils.extractUrlComponent(url, RQ.URL_COMPONENTS.PATH)).toBe(
      "/web/index.html"
    );
  });

  it("should extract query param string from url", function () {
    expect(RQ.Utils.extractUrlComponent(url, RQ.URL_COMPONENTS.QUERY)).toBe(
      "?a=1"
    );
  });

  it("should extract hash from url", function () {
    expect(RQ.Utils.extractUrlComponent(url, RQ.URL_COMPONENTS.HASH)).toBe(
      "#users"
    );
  });
});

describe("validate Cookie", function () {
  it("should set the cookie", function () {
    const cookieName = "username";
    const cookieValue = "requestly";
    const cookieLife = 200000000000;
    var beforeCookieArrayLength = document.cookie.split(";").length;
    RQ.Utils.setCookie(cookieName, cookieValue, cookieLife);
    expect(document.cookie.split(";")[0].indexOf(cookieName)).toBe(0);
    expect(document.cookie.split(";").indexOf("notExists")).toBe(-1);
  });

  it("it should read the cookie", function () {
    const cookieName = "username";
    const cookieExpectedValue = "requestly";
    expect(RQ.Utils.readCookie(cookieName)).toBe(cookieExpectedValue);
  });

  it("it should erase the cookie", function () {
    const cookieName = "username";
    const cookieExpectedValue = "";
    RQ.Utils.eraseCookie(cookieName);
    expect(RQ.Utils.readCookie(cookieName)).toBe(cookieExpectedValue);
  });
});

describe("validate queryParams", function () {
  it("should get the query params", function () {
    const inputQueryParams = "?input=userName";
    var paramsMap = RQ.Utils.getQueryParamsMap(inputQueryParams);
    expect(paramsMap["input"][0]).toBe("userName");
  });

  it("should get param value as undefined when there is no = sign", function () {
    const urlSearchString = "?param1&param2=&param3&param4=",
      paramsMap = RQ.Utils.getQueryParamsMap(urlSearchString);

    expect(paramsMap["param1"][0]).toBeUndefined();
    expect(paramsMap["param2"][0]).toBe("");
    expect(paramsMap["param3"][0]).toBeUndefined();
    expect(paramsMap["param4"][0]).toBe("");
  });
});

describe("#convertQueryParamMapToString", function () {
  it("should be able to handle url with params containing no value (Issue: 343)", function () {
    const urlSearchString = "param1&param2&param3&param4",
      paramsMap = RQ.Utils.getQueryParamsMap(urlSearchString),
      paramsString = RQ.Utils.convertQueryParamMapToString(paramsMap);

    expect(urlSearchString).toBe(paramsString);
  });

  it("should be able to handle url with single params containing no value (Issue: 343)", function () {
    const urlSearchString = "param1",
      paramsMap = RQ.Utils.getQueryParamsMap(urlSearchString),
      paramsString = RQ.Utils.convertQueryParamMapToString(paramsMap);

    expect(urlSearchString).toBe(paramsString);
  });

  it("should be able to handle url with params containing empty value (Issue: 343)", function () {
    const urlSearchString = "param1=&param2=&param3=&param4=",
      paramsMap = RQ.Utils.getQueryParamsMap(urlSearchString),
      paramsString = RQ.Utils.convertQueryParamMapToString(paramsMap);

    expect(urlSearchString).toBe(paramsString);
  });

  it("should be able to handle url with single param containing empty value (Issue: 343)", function () {
    const urlSearchString = "param1=",
      paramsMap = RQ.Utils.getQueryParamsMap(urlSearchString),
      paramsString = RQ.Utils.convertQueryParamMapToString(paramsMap);

    expect(urlSearchString).toBe(paramsString);
  });

  it("should be able to handle url with params with no value and empty value (Issue: 343)", function () {
    const urlSearchString = "param1&param2=",
      paramsMap = RQ.Utils.getQueryParamsMap(urlSearchString),
      paramsString = RQ.Utils.convertQueryParamMapToString(paramsMap);

    expect(urlSearchString).toBe(paramsString);
  });
});

describe("#addDelay", function () {
  it("should run loop for 4000ms and it should be === delay", function () {
    const delay = 4000;
    const start = Date.now();
    RQ.Utils.addDelay(delay);
    const end = Date.now();

    expect(end - start).not.toBeLessThan(delay);
  });

  it("should run loop for 1000ms and it should be === delay", function () {
    const delay = 1000;
    const start = Date.now();
    RQ.Utils.addDelay(delay);
    const end = Date.now();

    expect(end - start).not.toBeLessThan(delay);
  });

  it("should run loop for 100ms and it should be === delay", function () {
    const delay = 100;
    const start = Date.now();
    RQ.Utils.addDelay(delay);
    const end = Date.now();

    expect(end - start).toBe(delay);
  });

  it("should run loop for 4000ms and it should !< delay", function () {
    const delay = 4000;
    const start = Date.now();
    RQ.Utils.addDelay(delay);
    const end = Date.now();

    expect(end - start).not.toBeLessThan(delay);
  });
});

describe("#addQueryParamToURL", function () {
  it("should return Url after adding query param when overwrite=false", function () {
    expect(
      RQ.Utils.addQueryParamToURL(URL_SOURCES.EXAMPLE, "a", "90", false)
    ).toBe(URL_SOURCES.EXAMPLE + "?a=90");
  });

  it("should return Url after adding query param when overwrite=false", function () {
    expect(
      RQ.Utils.addQueryParamToURL(
        URL_SOURCES.EXAMPLE + "?a=1#check",
        "a",
        "90",
        false
      )
    ).toBe(URL_SOURCES.EXAMPLE + "?a=1&a=90#check");
  });

  it("should return Url after adding query param when overwrite=true", function () {
    expect(
      RQ.Utils.addQueryParamToURL(
        URL_SOURCES.EXAMPLE + "?a=1#check",
        "a",
        "90",
        true
      )
    ).toBe(URL_SOURCES.EXAMPLE + "?a=90#check");
  });
});

describe("#generateExecutionLogId", () => {
  it("should return ID of length same as Date.now()", () => {
    expect(RQ.Utils.generateExecutionLogId().length).toEqual(
      `executionLog_${Date.now()}`.length
    );
  });
});

describe("#jsonifyValidJSONString", () => {
  it("should convert valid JSON string to JSON Object", () => {
    const obj = {
      a: [1, 2, 3],
      b: "alpha",
      c: {
        name: "gamma",
      },
    };

    const objString = JSON.stringify(obj);
    const resultObj = RQ.Utils.jsonifyValidJSONString(objString);

    expect(resultObj.a.length).toBe(obj.a.length);
    expect(resultObj.b).toBe(obj.b);
  });

  it("should not ammend anything to non-json strings", () => {
    expect(RQ.Utils.jsonifyValidJSONString("requestly")).toBe("requestly");
    expect(RQ.Utils.jsonifyValidJSONString('{"requestly"}')).toBe(
      '{"requestly"}'
    );
    expect(RQ.Utils.jsonifyValidJSONString("")).toBe("");
  });

  it("should not change the object if input is non-string", () => {
    const o = {};
    const n = 1;
    const b = false;
    const a = [];

    expect(RQ.Utils.jsonifyValidJSONString(o)).toBe(o);
    expect(RQ.Utils.jsonifyValidJSONString(n)).toBe(n);
    expect(RQ.Utils.jsonifyValidJSONString(b)).toBe(b);
    expect(RQ.Utils.jsonifyValidJSONString(a)).toBe(a);
  });
});

describe("#convertSearchParamsToJSON", () => {
  it("should convert JSON object for query params string containing JSON value (AirBnb case", () => {
    const str =
      "/api/v3/ExploreSections?operationName=ExploreSections&locale=en-IN&currency=INR&_cb=0n5eh6r0jjst6d0uv62aj0eapcti&variables=%7B%22isInitialLoad%22%3Atrue%2C%22hasLoggedIn%22%3Afalse%2C%22cdnCacheSafe%22%3Afalse%2C%22source%22%3A%22EXPLORE%22%2C%22exploreRequest%22%3A%7B%22metadataOnly%22%3Afalse%2C%22version%22%3A%221.8.3%22%2C%22itemsPerGrid%22%3A20%2C%22refinementPaths%22%3A%5B%22%2Fhomes%22%5D%2C%22datePickerType%22%3A%22flexible_dates%22%2C%22searchMode%22%3A%22flex_destinations_search%22%2C%22flexDestinationsSessionId%22%3A%22c7f2c0f0-35db-492d-8d36-9853ce147c03%22%2C%22searchType%22%3A%22filter_change%22%2C%22tabId%22%3A%22home_tab%22%2C%22flexibleTripLengths%22%3A%5B%22seven_days_starting_long_weekend%22%5D%2C%22locationSearch%22%3A%22MIN_MAP_BOUNDS%22%2C%22categoryTag%22%3A%22Tag%3A8225%22%2C%22cdnCacheSafe%22%3Afalse%2C%22treatmentFlags%22%3A%5B%22flex_destinations_june_2021_launch_web_treatment%22%2C%22new_filter_bar_v2_fm_header%22%2C%22merch_header_breakpoint_expansion_web%22%2C%22flexible_dates_12_month_lead_time%22%2C%22storefronts_nov23_2021_homepage_web_treatment%22%2C%22flexible_dates_options_extend_one_three_seven_days%22%2C%22super_date_flexibility%22%2C%22micro_flex_improvements%22%2C%22micro_flex_show_by_default%22%2C%22search_input_placeholder_phrases%22%2C%22pets_fee_treatment%22%5D%2C%22screenSize%22%3A%22large%22%2C%22isInitialLoad%22%3Atrue%2C%22hasLoggedIn%22%3Afalse%7D%7D&extensions=%7B%22persistedQuery%22%3A%7B%22version%22%3A1%2C%22sha256Hash%22%3A%22b1d29cb5ceb9e30a019de87b90099a553a23494fc97a1ad40e1444e16c91cc84%22%7D%7D";
    const paramsObject = RQ.Utils.convertSearchParamsToJSON(str);

    expect(paramsObject["operationName"]).toBe("ExploreSections");
    expect(paramsObject["locale"]).toBe("en-IN");
    expect(paramsObject["variables"]["source"]).toBe("EXPLORE");
    expect(paramsObject["extensions"]["persistedQuery"]["version"]).toBe(1);
  });

  it("should return empty object when there are no search params in the URL", () => {
    expect(Object.keys(RQ.Utils.convertSearchParamsToJSON("")).length).toBe(0);
    expect(
      Object.keys(RQ.Utils.convertSearchParamsToJSON("Some Random String"))
        .length
    ).toBe(0);
    expect(
      Object.keys(RQ.Utils.convertSearchParamsToJSON("https://google.com"))
        .length
    ).toBe(0);
    expect(
      Object.keys(RQ.Utils.convertSearchParamsToJSON("https://google.com?"))
        .length
    ).toBe(0);
    expect(
      Object.keys(
        RQ.Utils.convertSearchParamsToJSON("https://google.com#fragmentCase")
      ).length
    ).toBe(0);
  });

  it("should work for simple URLs containing query params", () => {
    const str = "https://google.com?a=1&b=2";
    const paramsObject = RQ.Utils.convertSearchParamsToJSON(str);

    expect(paramsObject["a"]).toBe(1);
    expect(paramsObject["b"]).toBe(2);
  });
});

describe("#traverseJsonByPath", () => {
  it("should read first level and nested keys in JSON objects", () => {
    const q = {
      operationName: "MapsQuery",
      query: {
        name: "list",
        steps: [1, 2, 3, 4],
      },
      variables: [1, 2, 3, 4],
    };

    expect(RQ.Utils.traverseJsonByPath(q, "operationName")).toBe("MapsQuery");
    expect(RQ.Utils.traverseJsonByPath(q, "operationName.X")).toBeUndefined();
    expect(RQ.Utils.traverseJsonByPath(q, "X.Y.Z")).toBeUndefined();
    expect(RQ.Utils.traverseJsonByPath(q, "query.steps.2")).toBe(3);
    expect(RQ.Utils.traverseJsonByPath(q, "query.steps.test")).toBeUndefined();
  });

  it("should handle arrays inside JSON Object", () => {
    const j = {
      a: [100, 200, 300, 400, { n: "requestly", i: "yc" }, "stringValue"],
    };

    expect(RQ.Utils.traverseJsonByPath(j, "a.2")).toBe(300);
    expect(RQ.Utils.traverseJsonByPath(j, "a.4.n")).toBe("requestly");
    expect(RQ.Utils.traverseJsonByPath(j, "a.2.x")).toBeUndefined();
    expect(RQ.Utils.traverseJsonByPath(j, "a.10")).toBeUndefined();
  });
});

describe("#setObjectValueAtPath", () => {
  it("should set the value at given path", () => {
    const q = {
      operationName: "MapsQuery",
      query: {
        name: "list",
        steps: [1, 2, 3, 4],
      },
      variables: [1, 2, 3, 4],
    };
    RQ.Utils.setObjectValueAtPath(q, "category", "sports");

    expect(q).toEqual(jasmine.objectContaining({ category: "sports" }));
  });
});
