export interface AJAXRequestDetails {
  url: string;
  method: string;
  type: "xmlhttprequest";
  initiatorDomain: string;
  requestHeaders?: Record<string, string>;
}

export enum SessionRuleType {
  FORWARD_IGNORED_HEADERS = "forwardIgnoredHeaders",
  INITIATOR_DOMAIN = "initiatorDomain",
  CSP_ERROR = "cspError",
}
