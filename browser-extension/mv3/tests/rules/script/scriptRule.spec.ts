import { test, expect } from "../../fixtures";
import { loadRules } from "../../utils";
import scriptRules from "./script_rules.json";
import testScenarios, { ScriptTestScenario } from "./testScenarios";
import { IBaseTestData } from "../types";

test.describe("Script Rule", () => {
  testScenarios.forEach((scenario, i) => {
    test(scenario.description, async ({ appPage, context }) => {
      await testScriptRule({ appPage, context, ...scenario });
    });
  });
});

const RQ_CLASSNAME = "__RQ_SCRIPT__";

const testScriptRule = async (testScenarioData: ScriptTestScenario & IBaseTestData) => {
  const { appPage, context, ruleIds, testPageURL } = testScenarioData;
  const rules = ruleIds.reduce((acc, ruleId) => ({ ...acc, [ruleId]: scriptRules[ruleId] }), {});
  await loadRules(appPage, rules);

  // @ts-ignore
  const rulePairElementData: any[] = Object.values(rules).reduce(
    (acc, rule) => [
      // @ts-ignore
      ...acc,
      // @ts-ignore
      ...rule.pairs[0].scripts.reduce(
        (scriptAcc, script) => [
          ...scriptAcc,
          {
            type: script.codeType == "js" ? "script" : "style",
            attributes: script.attributes,
            innerText: script.type === "code" ? script.value : undefined,
            url: script.type === "url" ? script.value : undefined,
            value: script.value,
            sourceType: script.type,
          },
        ],
        []
      ),
    ],
    []
  );

  const testPage = await context.newPage();
  testPage.on("console", (msg) => console.log("PAGE LOG:", msg.text()));

  await testPage.goto(testPageURL, { waitUntil: "networkidle" });

  const RQElements = await testPage.locator(`.${RQ_CLASSNAME}`).all();
  console.log("RQElements", RQElements);
  const insertedElementDataPromises = RQElements.map(async (element) => {
    const type = await element.evaluate((el) => el.tagName.toLowerCase());
    const attributes = await element.evaluate((el) => {
      const attrs = el.attributes;
      return Array.from(attrs).map((attr) => ({ name: attr.name, value: attr.value }));
    });
    const innerText = await element.evaluate((el: HTMLElement) => el.innerText);
    return { type, attributes, innerText };
  });

  const insertedElementData = await Promise.all(insertedElementDataPromises);

  for (const element of rulePairElementData) {
    console.log("element", element);
    const matchingEntry = insertedElementData.find((entry) => {
      console.log("entry", entry);
      if (entry.type === element.type) {
        if (element.sourceType === "code") {
          return entry.innerText === element.innerText;
        } else {
          return entry.attributes.find((attr) => attr.name === "src" && attr.value === element.url);
        }
      }
      return false;
    });
    expect(matchingEntry).toBeDefined();
    expect(matchingEntry?.attributes).toEqual(element.attributes);
  }
};
