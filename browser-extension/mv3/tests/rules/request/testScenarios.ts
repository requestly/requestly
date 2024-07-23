export interface RequestRuleTestScenarioData {
  ruleIds: string[];
  testPageURL: string;
  pageActions?: () => void;
  expectedRequestModifications: {
    testUrl: string;
    expectedRequestBody: string | Record<any, any>;
  }[];
}

const testScenarios: RequestRuleTestScenarioData[] = [
  {
    ruleIds: ["Request_1"],
    testPageURL: "https://example.com/",
    pageActions: () => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "https://requestly.tech/api/mockv2/request_rule?teamId=9sBQkTnxaMlBY6kWHpoz");
      xhr.setRequestHeader("content-type", "application/json");
      xhr.send('{"foo": "bar1"}');
    },
    expectedRequestModifications: [
      {
        testUrl: "https://requestly.tech/api/mockv2/request_rule?teamId=9sBQkTnxaMlBY6kWHpoz",
        expectedRequestBody: { request: "rule", static: "modification" },
      },
    ],
  },
  {
    ruleIds: ["Request_2"],
    testPageURL: "https://example.com/",
    pageActions: () => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "https://requestly.tech/api/mockv2/request_rule?teamId=9sBQkTnxaMlBY6kWHpoz");
      xhr.setRequestHeader("content-type", "application/json");
      xhr.send('{"foo": "bar1"}');
    },
    expectedRequestModifications: [
      {
        testUrl: "https://requestly.tech/api/mockv2/request_rule?teamId=9sBQkTnxaMlBY6kWHpoz",
        expectedRequestBody: { dynamic: "modification" },
      },
    ],
  },
];

export default testScenarios;
