import { HttpRequestMethod, ResourceType } from "~/types/common/network";
import { BaseItem, RecordType } from "./base";

export interface BaseRule extends BaseItem {
  objectType: RecordType.RULE;
  ruleType: RuleType;
  groupId?: string;
  schemaVersion?: string;

  // Determines if the rule is imported
  isModHeaderImport?: boolean;
  isCharlesImport?: boolean;
}

export type Rule =
  | RedirectRule.Record
  | ReplaceRule.Record
  | QueryParamRule.Record
  | CancelRule.Record
  | DelayRule.Record
  | HeaderRule.Record
  | UserAgentRule.Record
  | RequestRule.Record
  | ResponseRule.Record
  | ScriptRule.Record;

export namespace RedirectRule {
  export interface Record extends BaseRule {
    ruleType: RuleType.REDIRECT;
    pairs: Pair[];
  }

  interface Pair extends BaseRulePair {
    destinationType?: DestinationType;
    destination: string;
  }

  export enum DestinationType {
    URL = "url",
    MAP_LOCAL = "map_local",
    MOCK_OR_FILE_PICKER = "mock_or_file_picker",
  }
}

export namespace ReplaceRule {
  export interface Record extends BaseRule {
    ruleType: RuleType.REPLACE;
    pairs: Pair[];
  }

  export interface Pair extends BaseRulePair {
    from: string;
    to: string;
  }
}

export namespace QueryParamRule {
  export interface Record extends BaseRule {
    ruleType: RuleType.QUERYPARAM;
    pairs: Pair[];
  }

  export interface Pair extends BaseRulePair {
    modifications: Modification[];
  }

  export enum ModificationType {
    ADD = "Add",
    REMOVE = "Remove",
    REMOVE_ALL = "Remove All",
  }

  export interface Modification {
    id?: string;
    param: string;
    value: string;
    actionWhenParamExists?: string;
    type: ModificationType;
  }
}

export namespace CancelRule {
  export interface Record extends BaseRule {
    ruleType: RuleType.CANCEL;
    pairs: Pair[];
  }

  type Pair = BaseRulePair;
}

export namespace DelayRule {
  export interface Record extends BaseRule {
    ruleType: RuleType.DELAY;
    pairs: Pair[];
  }

  interface Pair extends BaseRulePair {
    delay: string; // FIX to number. Legacy issue
  }
}

export namespace HeaderRule {
  export interface Record extends BaseRule {
    ruleType: RuleType.HEADERS;
    pairs: Pair[];
  }

  export interface Pair extends BaseRulePair {
    modifications: {
      Request?: Modification[];
      Response?: Modification[];
    };
  }

  export interface Modification {
    id?: string;
    header: string;
    type: ModificationType;
    value: string;
  }

  export enum ModificationType {
    ADD = "Add",
    REMOVE = "Remove",
    MODIFY = "Modify",
  }
}

export namespace UserAgentRule {
  export interface Record extends BaseRule {
    ruleType: RuleType.USERAGENT;
    pairs: Pair[];
  }

  interface Pair extends BaseRulePair {
    userAgent: string;
    env?: string;
    envType?: "browser" | "device" | "custom";
  }
}

export namespace RequestRule {
  export interface Record extends BaseRule {
    ruleType: RuleType.REQUEST;
    pairs: Pair[];
  }

  export interface Pair extends BaseRulePair {
    request: {
      type: BodyType;
      value: string;
      resourceType?: ResourceType;
    };
  }

  enum BodyType {
    CODE = "code",
    STATIC = "static",
  }

  export enum ResourceType {
    UNKNOWN = "unknown",
    REST_API = "restApi",
    GRAPHQL_API = "graphqlApi",
  }
}

export namespace ResponseRule {
  export interface Record extends BaseRule {
    ruleType: RuleType.RESPONSE;
    pairs: Pair[];
  }

  export interface Pair extends BaseRulePair {
    response: {
      type: BodyType;
      value: string;
      resourceType?: ResourceType;
      statusCode?: string;
      statusText?: String;
    };
  }

  export enum BodyType {
    CODE = "code",
    STATIC = "static",
  }

  export enum ResourceType {
    UNKNOWN = "unknown",
    REST_API = "restApi",
    GRAPHQL_API = "graphqlApi",
    STATIC = "static", //  HTML / JS / CSS
  }
}

export namespace ScriptRule {
  export interface Record extends BaseRule {
    ruleType: RuleType.SCRIPT;
    pairs: Pair[];

    removeCSPHeader?: boolean;
  }

  interface Pair extends BaseRulePair {
    scripts: ScriptRuleModifications[];
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

  export enum ScriptType {
    JS = "js",
    CSS = "css",
  }

  export enum ScriptLoadTime {
    BEFORE_PAGE_LOAD = "beforePageLoad",
    AFTER_PAGE_LOAD = "afterPageLoad",
    AS_SOON_AS_POSSIBLE = "asSoonAsPossible",
  }

  export enum ScriptValueType {
    URL = "url",
    CODE = "code",
  }
}

/** Common **/
export enum RuleType {
  REDIRECT = "Redirect",
  REPLACE = "Replace",
  QUERYPARAM = "QueryParam",
  CANCEL = "Cancel",
  DELAY = "Delay",
  HEADERS = "Headers",
  USERAGENT = "UserAgent",
  REQUEST = "Request",
  RESPONSE = "Response",
  SCRIPT = "Script",
}

interface BaseRulePair {
  id: string;
  source: RulePairSource;
}

export interface RulePairSource {
  key: RuleSourceKey;
  operator: RuleSourceOperator;
  value: string;
  filters?: RuleSourceFilter[]; // FIX: This should not be an array
}

export interface RuleSourceFilter {
  pageUrl?: {
    operator: RuleSourceOperator;
    value: string;
  };
  requestMethod?: HttpRequestMethod[];
  resourceType?: ResourceType[];
  pageDomains?: string[];
  requestPayload?: { key: string; value: string; operator: RuleSourceOperator };
}

export enum RuleSourceKey {
  URL = "Url",
  HOST = "host",
  PATH = "path",
}

export enum RuleSourceOperator {
  EQUALS = "Equals",
  CONTAINS = "Contains",
  MATCHES = "Matches",
  WILDCARD_MATCHES = "Wildcard_Matches",
}
