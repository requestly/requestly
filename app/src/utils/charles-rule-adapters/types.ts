import { HeaderRuleActionType } from "types";

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
  selectedHostsTool: Record<string, unknown>;
  toolEnabled: boolean;
  useSelectedLocations: boolean;
};
