import { HttpRequestMethod, ResourceType } from "types/network";

export enum RuleEditorMode {
  EDIT = "edit",
  CREATE = "create",
}

export enum RecordType {
  RULE = "rule",
  GROUP = "group",
}

export enum RecordStatus {
  ACTIVE = "Active",
  INACTIVE = "Inactive",
}

export enum RuleType {
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
interface RecordMetaData {
  createdBy: string;
  creationDate: number;
  currentOwner: string;
  lastModifiedBy: string;
  modificationDate: number;
}

export interface RuleRecord extends RecordMetaData {
  id: string;
  name: string;
  description: string;
  groupId?: GroupRecord["id"];
  objectType: RecordType.RULE;
  status: RecordStatus;
  isFavourite?: boolean;
}

interface GroupRecord extends RecordMetaData {
  id: string;
  name: string;
  objectType: RecordType.GROUP;
  status: RecordStatus;
  isFavourite?: boolean;
}

interface RulePairSource {
  key: RuleSourceKey;
  operator: RuleSourceOperator;
  value: string;
  filters: RuleSourceFilter[];
}

interface BaseRulePair {
  id: string;
  source: RulePairSource;
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

/** Rules **/
interface RedirectRulePair extends BaseRulePair {
  source: RulePairSource;
  destinationType?: RedirectDestinationType;
  destination: string;
}

export interface RedirectRule extends RuleRecord {
  ruleType: RuleType.REDIRECT;
  pairs: RedirectRulePair[];
}

interface ReplaceRulePair extends BaseRulePair {
  from: string;
  to: string;
}

export interface ReplaceRule extends RuleRecord {
  ruleType: RuleType.REPLACE;
  pairs: ReplaceRulePair[];
}

type CancelRulePair = BaseRulePair;

export interface CancelRule extends RuleRecord {
  ruleType: RuleType.CANCEL;
  pairs: CancelRulePair[];
}

enum HeaderRuleActionType {
  ADD = "Add",
  REMOVE = "Remove",
  MODIFY = "Modify",
}

interface HeadersRuleModificationData {
  id?: string;
  header: string;
  type: HeaderRuleActionType;
  value: string;
}

interface HeadersRulePair extends BaseRulePair {
  modifications: {
    Request: HeadersRuleModificationData[];
    Response: HeadersRuleModificationData[];
  };
}

export interface HeadersRule extends RuleRecord {
  ruleType: RuleType.HEADERS;
  pairs: HeadersRulePair[];
}

interface UserAgentRulePair extends BaseRulePair {
  userAgent: string;
  env?: string;
  envType?: "browser" | "device" | "custom";
}

export interface UserAgentRule extends RuleRecord {
  ruleType: RuleType.USERAGENT;
  pairs: UserAgentRulePair[];
}

enum ScriptType {
  JS = "js",
  CSS = "css",
}

enum ScriptLoadTime {
  BEFORE_PAGE_LOAD = "beforePageLoad",
  AFTER_PAGE_LOAD = "afterPageLoad",
  AS_SOON_AS_POSSIBLE = "asSoonAsPossible",
}

enum ScriptValueType {
  URL = "url",
  CODE = "code",
}
interface ScriptRuleModifications {
  codeType: ScriptType;
  value: string;
  loadTime: ScriptLoadTime;
  type: ScriptValueType;
  id: string;
  fileName?: string; // probably not required
  // todo: add attributes array
}
interface ScriptRulePair extends BaseRulePair {
  scripts: ScriptRuleModifications[];
}

export interface ScriptRule extends RuleRecord {
  ruleType: RuleType.SCRIPT;
  pairs: ScriptRulePair[];
}

enum QueryParamModificationType {
  ADD = "Add",
  REMOVE = "Remove",
  REMOVE_ALL = "Remove All",
}

interface QueryParamRuleModification {
  id?: string;
  param: string;
  value: string;
  actionWhenParamExists?: string;
  type: QueryParamModificationType;
}
interface QueryParamRulePair extends BaseRulePair {
  modifications: QueryParamRuleModification[];
}

export interface QueryParamRule extends RuleRecord {
  ruleType: RuleType.QUERYPARAM;
  pairs: QueryParamRulePair[];
}

enum ResponseRuleBodyType {
  CODE = "code",
  STATIC = "static",
}

enum ResponseRuleResourceType {
  UNKNOWN = "unknown",
  REST_API = "restApi",
  GRAPHQL_API = "graphqlApi",
  STATIC = "static", //  HTML / JS / CSS
}

interface ResponseRulePair extends BaseRulePair {
  response: {
    type: ResponseRuleBodyType;
    value: string;
    resourceType?: ResponseRuleResourceType;
    statusCode?: string;
  };
}

export interface ResponseRule extends RuleRecord {
  ruleType: RuleType.RESPONSE;
  pairs: ResponseRulePair[];
}

enum RequestRuleBodyType {
  CODE = "code",
  STATIC = "static",
}

interface RequestRulePair extends BaseRulePair {
  request: {
    type: RequestRuleBodyType;
    value: string;
    statusCode?: string;
  };
}

export interface RequestRule extends RuleRecord {
  ruleType: RuleType.REQUEST;
  pairs: RequestRulePair[];
}

interface DelayRulePair extends BaseRulePair {
  delay: number;
}

export interface DelayRule extends RuleRecord {
  ruleType: RuleType.DELAY;
  pairs: DelayRulePair[];
}

export type Rule =
  | RedirectRule
  | CancelRule
  | ReplaceRule
  | HeadersRule
  | UserAgentRule
  | QueryParamRule
  | ResponseRule
  | RequestRule
  | DelayRule
  | ScriptRule;

export interface Group extends GroupRecord {}

export type StorageRecord = Rule | Group; // todo: rename
