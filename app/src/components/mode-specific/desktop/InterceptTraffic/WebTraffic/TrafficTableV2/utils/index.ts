import { getNewGroup, getNewRule } from "components/features/rules/RuleBuilder/actions";
import parser from "ua-parser-js";
//@ts-ignore
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import { StorageService } from "init";
import { cloneDeep } from "lodash";
import { STATUS_CODE_LABEL_ONLY_OPTIONS } from "config/constants/sub/statusCode";
import { RecordType } from "@requestly/shared/types/entities/rules";
import clientRuleStorageService from "services/clientStorageService/features/rule";

export const getRequestDomain = (log: any) => {
  const domain = log?.request?.host;
  return domain;
};

// todo fix: app name for chromium based browsers is always chrome
export const getRequestApp = (log: any) => {
  const ua = log?.request?.headers["user-agent"];
  const app = getAppNameFromUA(ua);
  return app;
};

/**
 * Processes user agent string of request header and gives back the app name.
 * It uses ua-parser-js library which returns browser name directly but if its an electron app,
 * in place of browser name "electron" is returned then by doing some string manipulations on the user-agent string
 * electron app name is obtained else if it is not an electron app the parser returns 'undefined', so app nam is
 * obtained from the user-agent string.
 *
 * @param {String} userAgent User Agent String
 * @returns {String} name of the app
 */
export const getAppNameFromUA = (userAgent: any) => {
  const { browser } = parser(userAgent);

  let appName;
  if (browser.name === "Electron") {
    appName = userAgent?.split(")")[2]?.split("/")[0];
  } else if (!browser.name) {
    appName = userAgent?.split("/")[0];
  } else {
    appName = browser.name;
  }
  return appName ?? "Unknown App";
};

type STATUS_CODE_LABEL = "1xx" | "2xx" | "3xx" | "4xx" | "5xx";

const isStatusCodeLabel = (value: string): value is STATUS_CODE_LABEL => {
  return STATUS_CODE_LABEL_ONLY_OPTIONS.some((options) => {
    return options.value === value;
  });
};

export const doesStatusCodeMatchLabels = (code: number = 0, labels: STATUS_CODE_LABEL[]) => {
  if (!code) return false; // some logs don't have status codes

  return labels.some((label) => {
    if (!isStatusCodeLabel(label)) {
      return parseInt(label) === code;
    } else {
      const statusCodeClass = parseInt(label.charAt(0));
      const lowerLimit = statusCodeClass * 100;
      const upperLimit = lowerLimit + 100;
      return lowerLimit <= code && code < upperLimit;
    }
  });
};

export const getOrCreateSessionGroup = async (
  sessionDetails: {
    networkSessionId: string;
    networkSessionName: string;
  },
  appMode: string
) => {
  if (!sessionDetails?.networkSessionId) {
    throw new Error("Session ID is required to create a session group");
  }

  const allGroups = await clientRuleStorageService.getRecordsByObjectType(RecordType.GROUP);
  let sessionGroup = allGroups.find((group: any) => group.sessionId === sessionDetails.networkSessionId);

  if (!sessionGroup) {
    const groupName = `[Mocks] ${sessionDetails.networkSessionName}`;
    sessionGroup = getNewGroup(groupName);
    await StorageService(appMode).saveRuleOrGroup({
      ...sessionGroup,
      sessionId: sessionDetails.networkSessionId,
      createdFromSession: true,
    });
  }

  return { groupId: sessionGroup.id, groupName: sessionGroup.name };
};

export const createResponseMock = (ruleParams: {
  responseDetails: Record<string, any>;
  urlMatcher: string;
  requestUrl: string;
  requestDetails: Record<string, any>;
  groupId: string;
  resourceType: string;
  operationKeys?: string[];
}) => {
  const newResponseRule = getNewRule("Response");
  const responseRulePair = cloneDeep(newResponseRule.pairs[0]);
  responseRulePair.response.value = ruleParams.responseDetails.body;
  responseRulePair.response.serveWithoutRequest = true;
  responseRulePair.response.resourceType = ruleParams.resourceType;
  responseRulePair.response.statusCode = ruleParams.responseDetails.statusCode;

  if (ruleParams.urlMatcher === GLOBAL_CONSTANTS.RULE_KEYS.URL) {
    responseRulePair.source.value = ruleParams.requestUrl;
    responseRulePair.source.key = ruleParams.urlMatcher;
    responseRulePair.source.operator = GLOBAL_CONSTANTS.RULE_OPERATORS.EQUALS;
  } else if (ruleParams.urlMatcher === GLOBAL_CONSTANTS.RULE_KEYS.PATH) {
    responseRulePair.source.value = ruleParams.requestDetails.path;
    responseRulePair.source.key = GLOBAL_CONSTANTS.RULE_KEYS.URL;
    responseRulePair.source.operator = GLOBAL_CONSTANTS.RULE_OPERATORS.CONTAINS;
  } else if (ruleParams.urlMatcher === "path_query") {
    const urlObject = new URL(ruleParams.requestUrl);
    responseRulePair.source.value = urlObject.pathname + urlObject.search;
    responseRulePair.source.key = GLOBAL_CONSTANTS.RULE_KEYS.URL;
    responseRulePair.source.operator = GLOBAL_CONSTANTS.RULE_OPERATORS.CONTAINS;
  }

  let operationParams = null;

  if (ruleParams.resourceType === "graphqlApi" && ruleParams.operationKeys.length) {
    const sourceFilters = responseRulePair.source.filters[0] ?? {};
    operationParams = getGraphQLOperationValues(JSON.parse(ruleParams.requestDetails.body), ruleParams.operationKeys);
    sourceFilters.requestPayload = {};

    if (operationParams) {
      sourceFilters.requestPayload.key = operationParams?.operationKey;
      sourceFilters.requestPayload.value =
        typeof operationParams?.operationValue === "string"
          ? operationParams?.operationValue
          : JSON.stringify(operationParams?.operationValue);
      responseRulePair.source.filters = [sourceFilters];
    }
  }

  return {
    ...newResponseRule,
    name: `${operationParams?.operationValue || ""} ${ruleParams.requestUrl}`,
    description: `Mock response for ${ruleParams.requestUrl} - ${operationParams?.operationValue || ""}`,
    groupId: ruleParams.groupId,
    createdFromSession: true,
    pairs: [responseRulePair],
    status: GLOBAL_CONSTANTS.RULE_STATUS.ACTIVE,
  };
};

export const getGraphQLOperationValues = (
  requestData: any,
  operationKeys: string[],
  operationValues?: string[]
): {
  operationKey: string;
  operationValue: string;
} | null => {
  // We only allow request payload targeting when requestData is JSON
  if (!requestData || typeof requestData !== "object") return null;
  if (Object.keys(requestData).length === 0) return null;

  let operationValueInRequestData: string | null = null;
  let operationKeyInRequestData: string | null = null;

  // tagettedKey is the json path e.g. a.b.0.c
  if (operationKeys.length) {
    operationKeys.some((key) => {
      const valueInRequestData = traverseJsonByPath(requestData, key);
      if (valueInRequestData) {
        operationKeyInRequestData = key;

        if (!operationValues || operationValues?.includes(valueInRequestData) || operationValues?.includes("*")) {
          operationValueInRequestData = valueInRequestData;
          return true;
        }
      }
      return false;
    });
  }

  if (operationValueInRequestData) {
    return { operationKey: operationKeyInRequestData, operationValue: operationValueInRequestData };
  }

  return null;
};

//TODO: Duplicated in common/utils
/**
 * @param {Object} json
 * @param {String} path -> "a", "a.b", "a.0.b (If a is an array containing list of objects"
 * Also copied in shared/utils.js for the sake of testing
 */
export const traverseJsonByPath = (jsonObject: any, path: any) => {
  if (!path) return;

  const pathParts = path.split(".");

  try {
    let i = 0;
    // Reach the last node but not the leaf node.
    for (i = 0; i < pathParts.length - 1; i++) {
      jsonObject = jsonObject[pathParts[i]];
    }

    return jsonObject[pathParts[pathParts.length - 1]];
  } catch (e) {
    /* Do nothing */
    console.log(e);
  }
};

/**
 * Returns true ONLY if the body is safe to render in CodeMirror.
 * Guarantees:
 * - No editor crashes
 * - No UI freezes
 * - No binary garbage rendering
 */
export function canPreviewAsText(body: any): boolean {
  // ---------- BASIC SANITY ----------
  if (typeof body !== "string" || body.length === 0) return false;

  // ---------- HARD SIZE LIMIT ----------
  // CodeMirror becomes unstable beyond this, suggested 5mb limit
  // Browsers aim for 60 FPS (~16ms per frame), and parsing, highlighting, and layout for 5MB can exceed this, causing jank.
  // Even with incremental parsing, long lines and syntax highlighting increase workload, sometimes leaving visible lines unhighlighted.
  // Viewport rendering helps, but the browser still tracks scroll offsets, line heights, and decorations for the entire document, increasing memory and computation.
  if (body.length > 5_000_000) return false; // ~5MB

  let text = body;

  // ---------- BYTE-MAP JSON (fonts/images sent as {0:123}) ----------
  // Example: {"0":60,"1":115,...}
  if (body[0] === "{" && body.length < 1_000_000 && /"\d+"\s*:\s*\d+/.test(body)) {
    try {
      const obj = JSON.parse(body);
      const keys = Object.keys(obj);

      // Reject sparse or insane maps
      if (keys.length === 0 || keys.length > 500_000) return false;

      // Parse keys as numeric indices and validate
      const numericKeys = [];
      let maxIndex = -1;

      for (const key of keys) {
        const index = parseInt(key, 10);
        // Validate key is a non-negative integer
        if (!Number.isInteger(index) || index < 0 || index.toString() !== key) {
          return false;
        }
        numericKeys.push(index);
        if (index > maxIndex) maxIndex = index;
      }

      // Compute needed length as (maxIndex + 1)
      const length = maxIndex + 1;
      if (length > 500_000) return false; // Safety check

      const bytes = new Uint8Array(length);

      // Iterate numeric keys and validate values
      for (const index of numericKeys) {
        const value = obj[index.toString()];
        // Validate value is a number 0-255
        if (typeof value !== "number" || value < 0 || value > 255 || !Number.isInteger(value)) {
          return false;
        }
        bytes[index] = value;
      }

      text = new TextDecoder("utf-8", { fatal: false }).decode(bytes);
    } catch {
      return false;
    }
  }

  // ---------- NULL BYTE DETECTION ----------
  // Binary ALWAYS contains null bytes
  if (text.indexOf("\u0000") !== -1) return false;

  // ---------- CONTROL CHARACTER DENSITY ----------
  // Binary has many non-printable chars
  let controlCount = 0;
  const scanLimit = Math.min(text.length, 10_000);

  for (let i = 0; i < scanLimit; i++) {
    const code = text.charCodeAt(i);
    if (code < 9 || (code > 13 && code < 32)) {
      controlCount++;
      if (controlCount > 100) return false;
    }
  }

  // ---------- BASE64 BLOB DETECTION ----------
  // Prevent rendering encoded binaries
  if (text.length > 800 && /^[A-Za-z0-9+/=\r\n]+$/.test(text.slice(0, 1000))) {
    return false;
  }

  // ---------- PRINTABLE RATIO ----------
  // Text must contain enough readable characters
  let printable = 0;
  for (let i = 0; i < scanLimit; i++) {
    const c = text.charCodeAt(i);
    if (c >= 32 && c <= 126) printable++;
  }

  if (printable / scanLimit < 0.6) return false;

  return true;
}
