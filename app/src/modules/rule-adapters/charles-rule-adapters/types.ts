import { HeaderRule, Rule, RuleSourceOperator } from "@requestly/shared/types/entities/rules";

export enum CharlesRuleImportErrorMessage {
  EMPTY_FILE = "Imported file is empty!",
  INVALID_EXPORT = "Not a valid Charles export!",
  SETTINGS_NOT_FOUND = "No Charles settings found in a file!",
}

export enum WhereToApplyRule {
  BOTH = "both",
  REQUEST = "request",
  RESPONSE = "response",
}

export enum Header {
  PRAGMA = "Pragma",
  CACHE_CONTROL = "Cache-Control",
  IF_MODIFIED_SINCE = "If-Modified-Since",
  IF_NONE_MATCH = "If-None-Match",
  EXPIRES = "Expires",
  LAST_MODIFIED = "Last-Modified",
  ETAG = "ETag",
  COOKIE = "Cookie",
  SET_COOKIE = "Set-Cookie",
}

export enum HeaderValue {
  UNKNOWN = "",
  NO_CACHE = "no-cache",
}

export enum CharlesRuleType {
  NO_CACHING = "No Caching",
  BLOCK_COOKIES = "Block Cookies",
  BLOCK_LIST = "Block List",
  MAP_LOCAL = "Map Local",
  MAP_REMOTE = "Map Remote",
  REWRITE = "Rewrite",
}

export type HeadersConfig<
  T = {
    value: string;
    header: string;
    type: HeaderRule.ModificationType;
  }
> = {
  requestHeaders: T[];
  responseHeaders: T[];
};

export type Location = {
  host: string;
  port?: number;
  protocol?: string;
  path?: string;
  query?: string;
};

export type SourceUrl = {
  enabled: boolean;
  location: Location;
};

export type SourceData = {
  value: string;
  status: boolean;
  operator: RuleSourceOperator;
};

export type ParsedRule<T = Rule> =
  | {
      type: CharlesRuleType;
      groups?: {
        rules: T[];
        status?: boolean;
        name: CharlesRuleType | string;
      }[];
    }
  | undefined;

export type ParsedRulesFromChalres = {
  groups?: ParsedRule["groups"];
  parsedRuleTypes?: CharlesRuleType[];
  otherRuleTypesCount?: number;
};

// rules
export type NoCachingRule = {
  string: string;
  selectedHostsTool: {
    toolEnabled: boolean;
    useSelectedLocations: boolean;
  } & Record<string, unknown>;
};

export type BlockCookiesRule = {
  string: string;
  selectedHostsTool: {
    toolEnabled: boolean;
    useSelectedLocations: boolean;
  } & Record<string, unknown>;
};

export type BlockListRule = {
  string: string;
  blacklist: {
    action: 0 | 1;
    toolEnabled: boolean;
    locations: {
      locationPatterns: {
        locationMatch: {
          enabled: boolean;
          location: Location;
        };
      };
    };
  };
};

export type MapRemoteRuleMapping<T = Location> = {
  sourceLocation: T;
  destLocation: T;
  enabled: boolean;
  preserveHostHeader: boolean;
};

export type MapRemoteRuleMappings = MapRemoteRuleMapping | MapRemoteRuleMapping[];

export type MapRemoteRule = {
  string: string;
  map: {
    toolEnabled: boolean;
    mappings: {
      mapMapping: MapRemoteRuleMappings;
    };
  };
};

export type MapLocalRuleMapping = {
  dest: string;
  sourceLocation: Location;
  enabled: boolean;
  caseSensitive: boolean;
};

export type MapLocalRuleMappings = MapLocalRuleMapping | MapLocalRuleMapping[];

export type MapLocalRule = {
  string: string;
  mapLocal: {
    toolEnabled: boolean;
    mappings: {
      mapLocalMapping: MapLocalRuleMappings;
    };
  };
};

export type RewriteRulePair = {
  /**
   * Tells if rule active or not
   */
  active: boolean;

  /**
   * Indicates the chosen option from rewrite rule
   * @example 1 = add headers and 2 = remove headers
   */
  ruleType: number;
  matchHeader: string;
  matchValue: string;
  matchHeaderRegex: boolean;
  matchValueRegex: boolean;

  /**
   *  Apply rule on request if true
   */
  matchRequest: boolean;

  /**
   *  Apply rule on response if true
   */
  matchResponse: boolean;
  newHeader: string;
  newValue: string;
  newHeaderRegex: boolean;
  newValueRegex: boolean;
  matchWholeValue: boolean;
  caseSensitive: boolean;
  replaceType: 1 | 2;
};

export type RewriteRulePairs = RewriteRulePair | RewriteRulePair[];

export type RewriteSet = {
  active: boolean;
  name: string;
  hosts: {
    locationPatterns: {
      locationMatch: SourceUrl | SourceUrl[];
    };
  };
  rules: {
    rewriteRule: RewriteRulePairs;
  };
};

export type RewriteSets = RewriteSet | RewriteSet[];

export type RewriteRule = {
  string: CharlesRuleType.REWRITE;
  rewrite: {
    toolEnabled: boolean;
    debugging: boolean;
    sets: {
      rewriteSet: RewriteSets;
    };
  };
};
