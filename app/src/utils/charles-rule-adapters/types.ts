import { HeaderRuleActionType } from "types";

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
    type: HeaderRuleActionType;
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
  location: Location;
  enabled: boolean;
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
