import { HttpRequestMethod, ResourceType } from "types/network";

export enum RuleObjType {
  RULE = "rule",
  GROUP = "group",
}

export enum RuleObjStatus {
  ACTIVE = "Active",
  INACTIVE = "Inactive",
}

enum RuleType {
  REDIRECT = "Redirect",
  HEADERS = "Headers",
  CANCEL = "Cancel",
  REPLACE = "Replace",
  USERAGENT = "UserAgent",
  SCRIPT = "Script",
  QUERYPARAM = "QueryParam",
  RESPONSE = "Response",
  REQUEST = "Request",
  DELAY = "Delay",
}

enum RuleSourceKey {
  URL = "Url",
  HOST = "host",
  PATH = "path",
}

enum RuleSourceOperator {
  EQUALS = "Equals",
  CONTAINS = "Contains",
  MATCHES = "Matches",
  WILDCARD_MATCHES = "Wildcard_Matches",
}

enum RedirectDestinationType {
  URL = "url",
  MAP_LOCAL = "map_local",
  MOCK_OR_FILE_PICKER = "mock_or_file_picker",
}

// Other mock, session can also extend this in future to keep consistency
interface BaseObj {
  createdBy: string;
  creationDate: number;
  currentOwner: string;
  lastModifiedBy: string;
  modificationDate: number;
}

interface BaseRuleObj extends BaseObj {
  id: string;
  name: string;
  description: string;
  groupId?: string;
  objectType: RuleObjType;
  status: RuleObjStatus;
  isFavourite?: boolean;
}

interface BaseRulePair {
  id: string;
}

/** Sub Types **/
interface RuleSourceFilter {
  pageUrl: {
    operator: RuleSourceOperator;
    value: string;
  };
  requestMethod: HttpRequestMethod[];
  resourceType: ResourceType[];
}

interface RulePairSource {
  key: RuleSourceKey;
  operator: RuleSourceOperator;
  value: string;
  filters: RuleSourceFilter[];
}

/** Rules **/
interface RedirectRulePair extends BaseRulePair {
  source: RulePairSource;
  destinationType?: RedirectDestinationType;
  destination: string;
}

export interface RedirectRule extends BaseRuleObj {
  objectType: RuleObjType.RULE;
  ruleType: RuleType.REDIRECT;
  pairs: RedirectRulePair[];
}

interface ReplaceRulePair extends BaseRulePair {
  source: RulePairSource;
  from: string;
  to: string;
}

export interface ReplaceRule extends BaseRuleObj {
  objectType: RuleObjType.RULE;
  ruleType: RuleType.REPLACE;
  pairs: ReplaceRulePair[];
}

interface CancelRulePair extends BaseRulePair {
  source: RulePairSource;
}

export interface CancelRule extends BaseRuleObj {
  objectType: RuleObjType.RULE;
  ruleType: RuleType.CANCEL;
  pairs: CancelRulePair[];
}

interface DelayRulePair extends BaseRulePair {
  source: RulePairSource;
  delay: number;
}

export interface DelayRule extends BaseRuleObj {
  objectType: RuleObjType.RULE;
  ruleType: RuleType.DELAY;
  pairs: DelayRulePair[];
}

// TODO: Rest of the Rules Pending

export type Rule = RedirectRule | CancelRule | ReplaceRule | DelayRule;

export interface Group extends BaseRuleObj {
  objectType: RuleObjType.GROUP;
}

export type RuleObj = Rule | Group;
