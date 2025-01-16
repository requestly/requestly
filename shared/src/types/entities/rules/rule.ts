import { HttpRequestMethod, ResourceType } from "@/types/common/network";
import { BaseItem, RecordType } from "./base";

export interface BaseRule extends BaseItem {
  objectType: RecordType.RULE;
  ruleType: RuleType;
  groupId?: string;
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
    pairs: RedirectRulePair[];
  }

  interface RedirectRulePair extends BaseRulePair {
    destinationType?: RedirectDestinationType;
    destination: string;
  }

  enum RedirectDestinationType {
    URL = "url",
    MAP_LOCAL = "map_local",
    MOCK_OR_FILE_PICKER = "mock_or_file_picker",
  }
}

export namespace ReplaceRule {
  export interface Record extends BaseRule {
    ruleType: RuleType.REPLACE;
    pairs: ReplaceRulePair[];
  }

  interface ReplaceRulePair extends BaseRulePair {
    from: string;
    to: string;
  }
}

export namespace QueryParamRule {
  export interface Record extends BaseRule {
    ruleType: RuleType.QUERYPARAM;
    pairs: QueryParamRulePair[];
  }

  interface QueryParamRulePair extends BaseRulePair {
    modifications: QueryParamRuleModification[];
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
}

export namespace CancelRule {
  export interface Record extends BaseRule {
    ruleType: RuleType.CANCEL;
    pairs: CancelRulePair[];
  }

  type CancelRulePair = BaseRulePair;
}

export namespace DelayRule {
  export interface Record extends BaseRule {
    ruleType: RuleType.DELAY;
    pairs: DelayRulePair[];
  }

  interface DelayRulePair extends BaseRulePair {
    delay: number;
  }
}

export namespace HeaderRule {
  export interface Record extends BaseRule {
    ruleType: RuleType.HEADERS;
    pairs: HeadersRulePair[];
  }

  interface HeadersRulePair extends BaseRulePair {
    modifications: {
      Request: HeadersRuleModificationData[];
      Response: HeadersRuleModificationData[];
    };
  }

  interface HeadersRuleModificationData {
    id?: string;
    header: string;
    type: HeaderRuleActionType;
    value: string;
  }

  enum HeaderRuleActionType {
    ADD = "Add",
    REMOVE = "Remove",
    MODIFY = "Modify",
  }
}

export namespace UserAgentRule {
  export interface Record extends BaseRule {
    ruleType: RuleType.USERAGENT;
    pairs: UserAgentRulePair[];
  }

  interface UserAgentRulePair extends BaseRulePair {
    userAgent: string;
    env?: string;
    envType?: "browser" | "device" | "custom";
  }
}

export namespace RequestRule {
  export interface Record extends BaseRule {
    ruleType: RuleType.REQUEST;
    pairs: RequestRulePair[];
  }

  interface RequestRulePair extends BaseRulePair {
    request: {
      type: RequestRuleBodyType;
      value: string;
      statusCode?: string;
    };
  }

  enum RequestRuleBodyType {
    CODE = "code",
    STATIC = "static",
  }
}

export namespace ResponseRule {
  export interface Record extends BaseRule {
    ruleType: RuleType.RESPONSE;
    pairs: ResponseRulePair[];
  }

  interface ResponseRulePair extends BaseRulePair {
    response: {
      type: ResponseRuleBodyType;
      value: string;
      resourceType?: ResponseRuleResourceType;
      statusCode?: string;
    };
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
}

export namespace ScriptRule {
  export interface Record extends BaseRule {
    ruleType: RuleType.SCRIPT;
    pairs: ScriptRulePair[];
  }

  interface ScriptRulePair extends BaseRulePair {
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

interface RulePairSource {
  key: RuleSourceKey;
  operator: RuleSourceOperator;
  value: string;
  filters: RuleSourceFilter[];
}

interface RuleSourceFilter {
  pageUrl: {
    operator: RuleSourceOperator;
    value: string;
  };
  requestMethod: HttpRequestMethod[];
  resourceType: ResourceType[];
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
