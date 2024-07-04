export interface ScriptTestScenario {
  description: string;
  ruleIds: string[];
  testPageURL: string;
}

const testScenarios: ScriptTestScenario[] = [
  {
    description: "JS - Code - ASAP",
    ruleIds: ["Script_1"],
    testPageURL: "https://youtube.com/",
  },
  {
    description: "JS - Code - Attributes",
    ruleIds: ["Script_2"],
    testPageURL: "https://example.com/",
  },
  {
    description: "JS - Code - OnPageLoad",
    ruleIds: ["Script_3"],
    testPageURL: "https://youtube.com/",
  },
  {
    description: "JS - URL - ASAP",
    ruleIds: ["Script_4"],
    testPageURL: "https://youtube.com/",
  },
  {
    description: "JS - URL - OnPageLoad",
    ruleIds: ["Script_5"],
    testPageURL: "https://june.so/",
  },
  {
    description: "CSS - Code",
    ruleIds: ["Script_6"],
    testPageURL: "https://example.com/",
  },
  {
    description: "CSS - URL",
    ruleIds: ["Script_7"],
    testPageURL: "https://example.com/",
  },
  {
    description: "Multiple Pairs (2 JS Code)",
    ruleIds: ["Script_8"],
    testPageURL: "https://developer.mozilla.org/",
  },
  {
    description: "Multiple Pairs (JS Code & URL)",
    ruleIds: ["Script_9"],
    testPageURL: "https://june.so/",
  },
  {
    description: "Multiple Pairs (2 CSS Code)",
    ruleIds: ["Script_10"],
    testPageURL: "https://developer.mozilla.org/",
  },
];

export default testScenarios;
