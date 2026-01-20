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

export enum SourceFilterTypes {
  PAGE_DOMAINS = "pageDomains",
  REQUEST_METHOD = "requestMethod",
  RESOURCE_TYPE = "resourceType",
}

export interface UrlSource {
  id?: string;
  isActive?: boolean;
  key: SourceKey;
  operator: SourceOperator;
  value: string;
  filters?: RuleSourceFilter[];
}

export interface RuleSourceFilter {
  pageDomains: string[];
  requestMethod: HttpRequestMethod[];
  resourceType: ResourceType[];
}

enum ResourceType {
  XHR = "xmlhttprequest",
  JS = "script",
  CSS = "stylesheet",
  Image = "image",
  Media = "media",
  Font = "font",
  WebSocket = "websocket",
  MainDocument = "main_frame",
  IFrameDocument = "sub_frame",
}

enum HttpRequestMethod {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  DELETE = "DELETE",
  PATCH = "PATCH",
  OPTIONS = "OPTIONS",
  CONNECT = "CONNECT",
  HEAD = "HEAD",
}

export enum AutoRecordingMode {
  CUSTOM = "custom",
  ALL_PAGES = "allPages",
}

export interface SessionRecordingConfig {
  maxDuration: number;
  pageSources: UrlSource[];
  autoRecording?: {
    isActive: boolean;
    mode: AutoRecordingMode;
  };
  notify?: boolean;
  explicit?: boolean;
  showWidget?: boolean;
  markRecordingIcon?: boolean;
  widgetPosition?: { top?: number; bottom?: number; left?: number; right?: number };
  recordingStartTime?: number;
  previousSession?: any;
}

export interface RulePair {
  id: string;
  source: UrlSource;
  destination?: string;
  to?: string;
  from?: string;
  modifications?: any;
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
  description?: string;
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

export interface ScriptAttributes {
  name: string;
  value: string;
}

export interface ScriptObject {
  codeType: ScriptCodeType;
  type: ScriptType;
  value: string;
  loadTime?: "afterPageLoad" | "beforePageLoad" | "asSoonAsPossible";
  attributes?: ScriptAttributes[];
}

export interface ScriptRulePair extends RulePair {
  scripts: ScriptObject[];
}

export interface ModifyRequestResponseObject {
  statusCode?: string;
  type: "static" | "code";
  value: string;
}

export interface ResponseRulePair extends RulePair {
  response: ModifyRequestResponseObject;
  serveWithoutRequest?: boolean;
}

export interface RequestRulePair extends RulePair {
  request: ModifyRequestResponseObject;
}
