// Could not validate this test case as the test environment is not setup correctly
import ModifyResponseRuleProcessor from "../../src/processors/ModifyResponseRuleProcessor";
import { getModifyResponseRule, URL_SOURCES } from "../helpers/MockObjects";

describe("ModifyResponseRuleProcessor:", function () {
  let modifyResponseRule;

  beforeEach(() => {
    modifyResponseRule = getModifyResponseRule();
  });

  afterEach(() => {
    modifyResponseRule = null;
  });

  it("should return null when no response is modified", function () {
    modifyResponseRule.pairs = [];
    expect(
      ModifyResponseRuleProcessor.process({
        rule: modifyResponseRule,
        requestURL: URL_SOURCES.TESTHEADERS,
      })
    ).toBeNull();
  });

  it("should return modified response when response is modified", function () {
    const response = ModifyResponseRuleProcessor.process({
      rule: modifyResponseRule,
      requestURL: URL_SOURCES.TESTHEADERS,
    });
    expect(response).not.toBeNull();
    expect(response.response).toEqual(`{
      "name": "John Doe",
      "age": 30,
      "email": "john.doe@example.com"
    }`);
  });

  it("should return the original status code if not specified", function () {
    modifyResponseRule.pairs[0].response.statusCode = "";
    const response = ModifyResponseRuleProcessor.process({
      rule: modifyResponseRule,
      requestURL: URL_SOURCES.TESTHEADERS,
    });
    expect(response).not.toBeNull();
    expect(response.statusCode).toEqual("");
  });

  it("should return the status code specified in the rule", function () {
    const response = ModifyResponseRuleProcessor.process({
      rule: modifyResponseRule,
      requestURL: URL_SOURCES.TESTHEADERS,
    });
    expect(response).not.toBeNull();
    expect(response.statusCode).toEqual("202");
  });
});
