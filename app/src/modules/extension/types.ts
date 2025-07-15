/* eslint-disable */
export type ExtensionRequestMethod = chrome.declarativeNetRequest.RequestMethod;

export type ExtensionResourceType = chrome.declarativeNetRequest.ResourceType;

export interface ExtensionRuleSourceFilters {
  requestMethods?: ExtensionRequestMethod[];
  resourceTypes?: ExtensionResourceType[];
}

export type ExtensionRuleAction = chrome.declarativeNetRequest.RuleAction;

export type ExtensionRuleCondition = chrome.declarativeNetRequest.RuleCondition & ExtensionRuleSourceFilters;

export type QueryParamRuleTransform = chrome.declarativeNetRequest.URLTransform;

export type ModifyHeaderInfo = chrome.declarativeNetRequest.ModifyHeaderInfo;

export type HeadersRuleOperation = chrome.declarativeNetRequest.HeaderOperation;

export type ExtensionRule = {
  action: ExtensionRuleAction;
  condition: ExtensionRuleCondition;
  priority?: number;
};

export enum HeaderOperation {
  APPEND = "append",
  SET = "set",
  REMOVE = "remove",
}

export enum RuleActionType {
  BLOCK = "block",
  REDIRECT = "redirect",
  ALLOW = "allow",
  UPGRADE_SCHEME = "upgradeScheme",
  MODIFY_HEADERS = "modifyHeaders",
  ALLOW_ALL_REQUESTS = "allowAllRequests",
}
