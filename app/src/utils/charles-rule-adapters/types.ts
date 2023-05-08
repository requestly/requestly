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

export type SourceUrl = {
  enabled: boolean;
  location: {
    host: string;
    port?: number;
    protocol?: string;
    path?: string;
    query?: string;
  };
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

type RemoteRuleMapping<T = SourceUrl> = {
  sourceLocation: T;
  destLocation: T;
  enabled: boolean;
  preserveHostHeader: boolean;
};

export type MapRemoteRule = {
  string: string;
  map: {
    toolEnabled: boolean;
    mappings: {
      mapMapping: RemoteRuleMapping | RemoteRuleMapping[];
    };
  };
};
