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

const MAX_PREVIEW_SIZE = 5 * 1024 * 1024; // 5 MB

const ALLOWED_MIME_TYPES = new Set([
  "text/plain",
  "text/html",
  "text/css",
  "text/javascript",
  "application/javascript",
  "application/x-javascript",
  "application/json",
  "application/xml",
  "text/xml",
  "application/xhtml+xml",
  "application/ecmascript",
]);

export function canRenderPreview(body?: string, contentType?: string): boolean {
  if (!body || !contentType) return false;
  // Size check
  const sizeInBytes = new TextEncoder().encode(body).length;
  if (sizeInBytes > MAX_PREVIEW_SIZE) return false;
  // Binary check
  if (body.includes("\0")) return false;
  const mime = contentType.split(";")[0].trim().toLowerCase();
  // Allow all text/*
  if (mime.startsWith("text/")) return true;
  // Explicit allowlist
  if (ALLOWED_MIME_TYPES.has(mime)) return true;
  // Vendor JSON (application/vnd.*+json)
  if (mime.endsWith("+json")) return true;
  // Vendor XML (application/vnd.*+xml)
  if (mime.endsWith("+xml")) return true;
  return false;
}
