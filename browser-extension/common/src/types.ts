export enum ObjectType {
  GROUP = "group",
  RULE = "rule",
}

export enum Status {
  ACTIVE = "Active",
  INACTIVE = "Inactive",
}

export interface ExtensionRule {
  action: chrome.declarativeNetRequest.RuleAction;
  condition: chrome.declarativeNetRequest.RuleCondition & {
    resourceTypes?: chrome.declarativeNetRequest.ResourceType[];
  };
  priority?: number;
}

export enum RuleType {
  REDIRECT = "Redirect",
  CANCEL = "Cancel",
  REPLACE = "Replace",
  HEADERS = "Headers",
  USERAGENT = "UserAgent",
  SCRIPT = "Script",
  QUERYPARAM = "QueryParam",
  RESPONSE = "Response",
  REQUEST = "Request",
  DELAY = "Delay",
}

export enum SourceKey {
  URL = "Url",
  HOST = "host",
  PATH = "path",
}

export enum SourceOperator {
  EQUALS = "Equals",
  CONTAINS = "Contains",
  MATCHES = "Matches",
  WILDCARD_MATCHES = "Wildcard_Matches",
}

export interface UrlSource {
  key: SourceKey;
  operator: SourceOperator;
  value: string;
  filters?: unknown[];
}

export interface SessionRecordingConfig {
  maxDuration: number;
  pageSources: UrlSource[];
}

export interface RulePair {
  source: UrlSource;
}

export interface Rule extends Record<string, unknown> {
  id: string;
  objectType?: ObjectType.RULE;
  ruleType: RuleType;
  status: Status;
  groupId?: string;
  extensionRules?: ExtensionRule[];
  pairs?: RulePair[];
  name: string;
  isFavourite?: boolean;
  modificationDate?: number;
}

export interface Group extends Record<string, unknown> {
  id: string;
  objectType: ObjectType.GROUP;
  status: Status;
  children: Rule[];
  isFavourite?: boolean;
}

export type RuleOrGroup = Rule | Group;

export enum StorageKey {
  SESSION_RECORDING_CONFIG = "sessionRecordingConfig",
}

export enum ScriptCodeType {
  JS = "js",
  CSS = "css",
}

export enum ScriptType {
  URL = "url",
  CODE = "code",
}

export interface ScriptObject {
  codeType: ScriptCodeType;
  type: ScriptType;
  value: string;
  loadTime?: "afterPageLoad" | "beforePageLoad";
}

export interface ScriptRulePair extends RulePair {
  scripts: ScriptObject[];
}

export interface ModifyResponseObject {
  statusCode?: string;
  type: "static" | "code";
  value: string;
}

export interface ResponseRulePair extends RulePair {
  response: ModifyResponseObject;
}
