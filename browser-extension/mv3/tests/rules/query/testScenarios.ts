import { Page } from "@playwright/test";

interface ParamInfo {
  name: string;
  value: string | null;
}

export interface QueryTestScenario {
  ruleIds: string[];
  description: string;
  testPageUrl: string; // url with query param string
  expectedQueryParams: Array<ParamInfo>;
  unexpectedParams?: Array<ParamInfo["name"]>;
  pageActions?: (page: Page) => Promise<void>;
}

const scenarios: QueryTestScenario[] = [
  // {
  //   description: "Adding multiple query params when no prior params",
  //   ruleIds: ["QueryParam_3"],
  //   testPageUrl: "https://example.com/",
  //   expectedQueryParams: [
  //     { name: "ping", value: "updatedPong" },
  //     { name: "foo1", value: "bar1" },
  //   ],
  // },
  // {
  //   description: "Adding multiple query params when other params exist",
  //   ruleIds: ["QueryParam_3"],
  //   testPageUrl: "https://example.com/?foo=bar",
  //   expectedQueryParams: [
  //     { name: "ping", value: "updatedPong" },
  //     { name: "foo1", value: "bar1" },
  //     { name: "foo", value: "bar" },
  //   ],
  // },
  // {
  //   description: "Adding multiple query params when same param in original request",
  //   ruleIds: ["QueryParam_3"],
  //   testPageUrl: "https://example.com/?foo1=bar2",
  //   expectedQueryParams: [
  //     { name: "ping", value: "updatedPong" },
  //     { name: "foo1", value: "bar1" },
  //   ],
  // },
  // {
  //   description: "Adding one query param to document",
  //   ruleIds: ["QueryParam_2"],
  //   testPageUrl: "https://example.com/",
  //   expectedQueryParams: [{ name: "foo", value: "bar" }],
  // },
  {
    description: "Should not affect query param if already there",
    ruleIds: ["QueryParam_2"],
    testPageUrl: "https://example.com/?foo=bar",
    expectedQueryParams: [{ name: "foo", value: "bar" }],
  },
  // {
  //   description: "Should update query param value if already there",
  //   ruleIds: ["QueryParam_2"],
  //   testPageUrl: "https://example.com/?foo=bar2",
  //   expectedQueryParams: [{ name: "foo", value: "bar" }],
  // },
  // {
  //   description: "Should append to existing query params",
  //   ruleIds: ["QueryParam_2"],
  //   testPageUrl: "https://example.com/?foo1=bar1",
  //   expectedQueryParams: [
  //     { name: "foo", value: "bar" },
  //     { name: "foo1", value: "bar1" },
  //   ],
  // },
  // {
  //   description: "Should remove query param if present",
  //   ruleIds: ["QueryParam_4"],
  //   testPageUrl: "https://example.com/?foo=bar",
  //   unexpectedParams: ["foo"],
  //   expectedQueryParams: [],
  // },
  // {
  //   description: "Should remove query param even if it has no value",
  //   ruleIds: ["QueryParam_4"],
  //   testPageUrl: "https://example.com/?foo",
  //   unexpectedParams: ["foo"],
  //   expectedQueryParams: [],
  // },
  // {
  //   description: "Remove should not affect other params",
  //   ruleIds: ["QueryParam_4"],
  //   testPageUrl: "https://example.com/?foo1=bar1&foo=bar",
  //   unexpectedParams: ["foo"],
  //   expectedQueryParams: [{ name: "foo1", value: "bar1" }],
  // },
  {
    description: "Remove should not apply if param not present",
    ruleIds: ["QueryParam_4"],
    testPageUrl: "https://example.com/?foo1=bar1&foo2=bar2",
    unexpectedParams: [],
    expectedQueryParams: [
      { name: "foo1", value: "bar1" },
      { name: "foo2", value: "bar2" },
    ],
  },
  {
    description: "Remove all when no param exists",
    ruleIds: ["QueryParam_4"],
    testPageUrl: "https://example.com/",
    unexpectedParams: [],
    expectedQueryParams: [],
  },
  // {
  //   description: "Remove all when one param exists",
  //   ruleIds: ["QueryParam_4"],
  //   testPageUrl: "https://example.com/?foo=bar",
  //   unexpectedParams: ["foo"],
  //   expectedQueryParams: [],
  // },
  // {
  //   description: "Remove all when one param without value exists",
  //   ruleIds: ["QueryParam_4"],
  //   testPageUrl: "https://example.com/?foo",
  //   unexpectedParams: ["foo"],
  //   expectedQueryParams: [],
  // },
  // {
  //   description: "Remove all when multiple params (without value) exist",
  //   ruleIds: ["QueryParam_4"],
  //   testPageUrl: "https://example.com/?foo&bar&baz",
  //   unexpectedParams: ["foo", "bar", "baz"],
  //   expectedQueryParams: [],
  // },
  // {
  //   description: "Remove all when multiple params of different types exist",
  //   ruleIds: ["QueryParam_4"],
  //   testPageUrl: "https://example.com/?foo=foo1&bar=bar1&baz",
  //   unexpectedParams: ["foo", "bar", "baz"],
  //   expectedQueryParams: [],
  // },
  {
    description: "Remove all when should not apply on a separate page",
    ruleIds: ["QueryParam_4"],
    testPageUrl: "https://example2.com/?foo=foo1&bar=bar1&baz=baz1",
    unexpectedParams: [],
    expectedQueryParams: [
      { name: "foo", value: "foo1" },
      { name: "bar", value: "bar1" },
      { name: "baz", value: "baz1" },
    ],
  },
];

export default scenarios;
