import { ExtensionRule } from "modules/extension/types";

export enum ObjectType {
  GROUP = "group",
  RULE = "rule",
}

export enum Status {
  ACTIVE = "Active",
  INACTIVE = "Inactive",
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

export interface Rule extends Record<string, unknown> {
  id: string;
  name: string;
  objectType?: ObjectType.RULE;
  ruleType: RuleType;
  status: Status;
  groupId?: string;
  extensionRules?: ExtensionRule[];
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

export enum QueryParamModificationType {
  ADD = "Add",
  REMOVE = "Remove",
  REMOVE_ALL = "Remove All",
}

export enum HeaderRuleActionType {
  ADD = "Add",
  REMOVE = "Remove",
  MODIFY = "Modify",
}

export enum ResponseRuleBodyType {
  CODE = "code",
  STATIC = "static",
}

export enum ResponseRuleResourceType {
  UNKNOWN = "unknown",
  REST_API = "restApi",
  GRAPHQL_API = "graphqlApi",
  STATIC = "static", //  HTML / JS / CSS
}

export interface SourceFilter {
  requestMethod?: string[];
  resourceType?: string[];
  requestPayload?: { key: string; value: string };
}

export interface RulePairSource {
  key: SourceKey;
  operator: SourceOperator;
  value: string;
  filters?: SourceFilter[];
}

export interface ResponseRulePair {
  id: string;
  source: RulePairSource;
  response: {
    value: string;
    statusCode: string;
    type: ResponseRuleBodyType;
    resourceType?: ResponseRuleResourceType;
  };
}

export enum RedirectDestinationType {
  URL = "url",
  MAP_LOCAL = "map_local",
  MOCK_OR_FILE_PICKER = "mock_or_file_picker",
}

export interface RedirectRulePair {
  destination: string;
  source: RulePairSource;
}

export interface RedirectRule extends Rule {
  pairs: RedirectRulePair[];
}

export interface CancelRulePair {
  source: RulePairSource;
}

export interface CancelRule extends Rule {
  pairs: CancelRulePair[];
}

export interface QueryParamRuleModification {
  param: string;
  value: string;
  type: QueryParamModificationType;
}

export interface QueryParamRulePair {
  source: RulePairSource;
  modifications: QueryParamRuleModification[];
}

export interface QueryParamRule extends Rule {
  pairs: QueryParamRulePair[];
}

export interface HeadersRuleModificationData {
  header: string;
  type: HeaderRuleActionType;
  value: string;
}

export interface HeadersRulePair {
  source: RulePairSource;
  modifications: {
    Request: HeadersRuleModificationData[];
    Response: HeadersRuleModificationData[];
  };
}

export interface HeadersRule extends Rule {
  pairs: HeadersRulePair[];
}

export interface UserAgentRulePair {
  source: RulePairSource;
  userAgent: string;
}

export interface UserAgentRule extends Rule {
  pairs: UserAgentRulePair[];
}

export interface DelayRulePair {
  source: RulePairSource;
  delay: string;
}

export interface DelayRule extends Rule {
  pairs: DelayRulePair[];
}

export interface ReplaceRulePair {
  from: string;
  to: string;
  source: RulePairSource;
}

export interface ReplaceRule extends Rule {
  pairs: ReplaceRulePair[];
}

export interface ScriptRulePair {
  source: RulePairSource;
}

export interface ScriptRule extends Rule {
  pairs: ScriptRulePair[];
  removeCSPHeader?: boolean;
}

export interface ResponseRule extends Rule {
  pairs: ResponseRulePair[];
}

// Group
export interface Group extends Record<string, unknown> {
  id: string;
  name: string;
  objectType: ObjectType.GROUP;
  status: Status;
  children: Rule[];
  isFavourite?: boolean;
}
