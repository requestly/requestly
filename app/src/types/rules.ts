// // these are existing copies of types newly created in features/rules/types/rules.ts
// import { ExtensionRule } from "modules/extension/types";

// enum ObjectType {
//   GROUP = "group",
//   RULE = "rule",
// }

// enum Status {
//   ACTIVE = "Active",
//   INACTIVE = "Inactive",
// }

// enum RuleType {
//   REDIRECT = "Redirect",
//   CANCEL = "Cancel",
//   REPLACE = "Replace",
//   HEADERS = "Headers",
//   USERAGENT = "UserAgent",
//   SCRIPT = "Script",
//   QUERYPARAM = "QueryParam",
//   RESPONSE = "Response",
//   REQUEST = "Request",
//   DELAY = "Delay",
// }
// // REDUNDANT COPY OF FEATURES/RULES/TYPES/RULES.TS
// interface Rule extends Record<string, unknown> {
//   id: string;
//   name: string;
//   description?: string;
//   objectType?: ObjectType.RULE;
//   ruleType: RuleType;
//   status: Status;
//   groupId?: string;
//   extensionRules?: ExtensionRule[];
//   pairs: Record<string, any>[];
// }

// enum SourceKey {
//   URL = "Url",
//   HOST = "host",
//   PATH = "path",
// }

// enum SourceOperator {
//   EQUALS = "Equals",
//   CONTAINS = "Contains",
//   MATCHES = "Matches",
//   WILDCARD_MATCHES = "Wildcard_Matches",
// }

// enum QueryParamModificationType {
//   ADD = "Add",
//   REMOVE = "Remove",
//   REMOVE_ALL = "Remove All",
// }

// enum HeaderRuleActionType {
//   ADD = "Add",
//   REMOVE = "Remove",
//   MODIFY = "Modify",
// }

// enum ResponseRuleBodyType {
//   CODE = "code",
//   STATIC = "static",
// }

// enum ResponseRuleResourceType {
//   UNKNOWN = "unknown",
//   REST_API = "restApi",
//   GRAPHQL_API = "graphqlApi",
//   STATIC = "static", //  HTML / JS / CSS
// }

// enum RequestRuleBodyType {
//   CODE = "code",
//   STATIC = "static",
// }

// interface SourceFilter {
//   requestMethod?: string[];
//   resourceType?: string[];
//   requestPayload?: { key: string; value: string };
//   pageUrl?: Record<string, string>;
//   pageDomains?: string[];
// }

// interface RulePairSource {
//   key: SourceKey;
//   operator: SourceOperator;
//   value: string;
//   filters?: SourceFilter[];
// }

// interface ResponseRulePair {
//   id: string;
//   source: RulePairSource;
//   response: {
//     value: string;
//     statusCode: string;
//     type: ResponseRuleBodyType;
//     resourceType?: ResponseRuleResourceType;
//   };
// }

// enum RedirectDestinationType {
//   URL = "url",
//   MAP_LOCAL = "map_local",
//   MOCK_OR_FILE_PICKER = "mock_or_file_picker",
// }

// interface RedirectRulePair {
//   destination: string;
//   source: RulePairSource;
// }

// interface RedirectRule extends Rule {
//   pairs: RedirectRulePair[];
// }

// interface CancelRulePair {
//   source: RulePairSource;
// }

// interface CancelRule extends Rule {
//   pairs: CancelRulePair[];
// }

// interface QueryParamRuleModification {
//   id?: string;
//   param: string;
//   value: string;
//   actionWhenParamExists?: string;
//   type: QueryParamModificationType;
// }

// interface QueryParamRulePair {
//   source: RulePairSource;
//   modifications: QueryParamRuleModification[];
// }

// interface QueryParamRule extends Rule {
//   pairs: QueryParamRulePair[];
// }

// interface HeadersRuleModificationData {
//   id?: string;
//   header: string;
//   type: HeaderRuleActionType;
//   value: string;
// }

// interface HeadersRulePair {
//   source: RulePairSource;
//   modifications: {
//     Request: HeadersRuleModificationData[];
//     Response: HeadersRuleModificationData[];
//   };
// }

// interface HeadersRule extends Rule {
//   pairs: HeadersRulePair[];
// }

// interface UserAgentRulePair {
//   source: RulePairSource;
//   userAgent: string;
// }

// interface UserAgentRule extends Rule {
//   pairs: UserAgentRulePair[];
// }

// interface DelayRulePair {
//   source: RulePairSource;
//   delay: string;
// }

// interface DelayRule extends Rule {
//   pairs: DelayRulePair[];
// }

// interface ReplaceRulePair {
//   from: string;
//   to: string;
//   source: RulePairSource;
// }

// interface ReplaceRule extends Rule {
//   pairs: ReplaceRulePair[];
// }

// interface ScriptRulePair {
//   source: RulePairSource;
// }

// interface ScriptRule extends Rule {
//   pairs: ScriptRulePair[];
//   removeCSPHeader?: boolean;
// }

// interface ResponseRule extends Rule {
//   pairs: ResponseRulePair[];
// }

// interface RequestRulePair {
//   id: string;
//   source: RulePairSource;
//   request: { value: string; statusCode: string; type: RequestRuleBodyType };
// }

// interface RequestRule extends Rule {
//   pairs: RequestRulePair[];
// }

// // Group
// interface Group extends Record<string, unknown> {
//   id: string;
//   name: string;
//   objectType: ObjectType.GROUP;
//   status: Status;
//   children?: Rule[];
//   isFavourite?: boolean;
// }
