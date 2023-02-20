describe("Requestly ScriptRuleHandler - ", function () {
  var scriptRules = [
    {
      name: "Script Rule 1",
      pairs: [
        {
          libraries: ["JQUERY"],
          scripts: [
            {
              codeType: RQ.SCRIPT_CODE_TYPES.JS,
              type: RQ.SCRIPT_TYPES.CODE,
              value: "jsCode11_afterPageLoad",
              loadTime: RQ.SCRIPT_LOAD_TIME.AFTER_PAGE_LOAD,
            },
            {
              codeType: RQ.SCRIPT_CODE_TYPES.JS,
              type: RQ.SCRIPT_TYPES.URL,
              value: "jsURL11_beforePageLoad",
              loadTime: RQ.SCRIPT_LOAD_TIME.BEFORE_PAGE_LOAD,
            },
            {
              codeType: RQ.SCRIPT_CODE_TYPES.CSS,
              type: RQ.SCRIPT_TYPES.URL,
              value: "cssURL11",
            },
          ],
        },
      ],
    },
    {
      name: "Script Rule 2",
      pairs: [
        {
          libraries: ["JQUERY", "UNDERSCORE"],
          scripts: [
            {
              codeType: RQ.SCRIPT_CODE_TYPES.CSS,
              type: RQ.SCRIPT_TYPES.URL,
              value: "cssURL21",
            },
            {
              codeType: RQ.SCRIPT_CODE_TYPES.CSS,
              type: RQ.SCRIPT_TYPES.CODE,
              value: "cssCode21",
            },
            {
              codeType: RQ.SCRIPT_CODE_TYPES.JS,
              type: RQ.SCRIPT_TYPES.CODE,
              value: "jsCode21_beforePageLoad",
              loadTime: RQ.SCRIPT_LOAD_TIME.BEFORE_PAGE_LOAD,
            },
          ],
        },
      ],
    },
  ];

  beforeEach(function () {
    window.DOM = [];
  });

  describe("#RQ.ScriptRuleHandler.handleRulePairs", function () {
    it("should handle rules in correct order", function () {
      RQ.ScriptRuleHandler.handleRules(scriptRules); // async

      waits(100);
      runs(function () {
        expect(window.DOM).toEqual([
          "cssURL11",
          "cssURL21",
          "cssCode21",
          RQ.SCRIPT_LIBRARIES["JQUERY"].src,
          RQ.SCRIPT_LIBRARIES["UNDERSCORE"].src,
          "jsURL11_beforePageLoad",
          "jsCode21_beforePageLoad",
          "jsCode11_afterPageLoad",
        ]);
      });
    });
  });
});
