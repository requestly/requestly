describe("Requestly ScriptRuleHandler - ", function () {
  // todo: add tests for rule changes
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
    {
      name: "Script Rule 3 - Empty attributes",
      pairs: [
        {
          libraries: ["JQUERY"],
          scripts: [
            {
              codeType: RQ.SCRIPT_CODE_TYPES.JS,
              type: RQ.SCRIPT_TYPES.URL,
              value: "jsURL31_beforePageLoad",
              loadTime: RQ.SCRIPT_LOAD_TIME.BEFORE_PAGE_LOAD,
              attributes: [],
            },
            {
              codeType: RQ.SCRIPT_CODE_TYPES.JS,
              type: RQ.SCRIPT_TYPES.CODE,
              value: "jsCode31_afterPageLoad",
              loadTime: RQ.SCRIPT_LOAD_TIME.AFTER_PAGE_LOAD,
              attributes: [],
            },
            {
              codeType: RQ.SCRIPT_CODE_TYPES.CSS,
              type: RQ.SCRIPT_TYPES.URL,
              value: "cssURL31",
              attributes: [],
            },
            {
              codeType: RQ.SCRIPT_CODE_TYPES.CSS,
              type: RQ.SCRIPT_TYPES.CODE,
              value: "cssCode31",
              attributes: [],
            },
          ],
        },
      ],
    },
    {
      name: "Script Rule 4 - Attributes",
      pairs: [
        {
          libraries: ["JQUERY"],
          scripts: [
            {
              codeType: RQ.SCRIPT_CODE_TYPES.JS,
              type: RQ.SCRIPT_TYPES.URL,
              value: "jsURL41_beforePageLoad",
              loadTime: RQ.SCRIPT_LOAD_TIME.BEFORE_PAGE_LOAD,
              attributes: [
                {
                  name: "attr1",
                  value: "value1",
                },
                {
                  name: "attr2",
                  value: "",
                },
                {
                  name: "class",
                  value: "jsURL41_beforePageLoad",
                },
                {
                  name: "id",
                  value: "jsURL41_beforePageLoad",
                },
              ],
            },
            {
              codeType: RQ.SCRIPT_CODE_TYPES.JS,
              type: RQ.SCRIPT_TYPES.CODE,
              value: "jsCode41_afterPageLoad",
              loadTime: RQ.SCRIPT_LOAD_TIME.AFTER_PAGE_LOAD,
              attributes: [
                {
                  name: "attr1",
                  value: "value1",
                },
                {
                  name: "attr2",
                  value: "",
                },
                {
                  name: "class",
                  value: "jsCode41_afterPageLoad",
                },
                {
                  name: "id",
                  value: "jsCode41_afterPageLoad",
                },
              ],
            },
            {
              codeType: RQ.SCRIPT_CODE_TYPES.CSS,
              type: RQ.SCRIPT_TYPES.URL,
              value: "cssURL41",
              attributes: [
                {
                  name: "attr1",
                  value: "value1",
                },
                {
                  name: "attr2",
                  value: "",
                },
                {
                  name: "class",
                  value: "cssURL41",
                },
                {
                  name: "id",
                  value: "cssURL41",
                },
              ],
            },
            {
              codeType: RQ.SCRIPT_CODE_TYPES.CSS,
              type: RQ.SCRIPT_TYPES.CODE,
              value: "cssCode41",
              attributes: [
                {
                  name: "attr1",
                  value: "value1",
                },
                {
                  name: "attr2",
                  value: "",
                },
                {
                  name: "class",
                  value: "cssCode41",
                },
                {
                  name: "id",
                  value: "cssCode41",
                },
              ],
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
          "cssURL31",
          "cssCode31",
          "cssURL41",
          "cssCode41",
          RQ.SCRIPT_LIBRARIES["JQUERY"].src,
          RQ.SCRIPT_LIBRARIES["UNDERSCORE"].src,
          "jsURL11_beforePageLoad",
          "jsCode21_beforePageLoad",
          "jsURL31_beforePageLoad",
          "jsURL41_beforePageLoad",
          "jsCode11_afterPageLoad",
          "jsCode31_afterPageLoad",
          "jsCode41_afterPageLoad",
        ]);
      });
    });
  });
});
