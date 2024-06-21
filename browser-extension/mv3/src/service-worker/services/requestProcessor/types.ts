export interface AJAXRequestDetails {
  url: string;
  method: string;
  type: "xmlhttprequest";
  initiator?: string; // initiator=origin. Should now contain port and protocol
  requestHeaders?: Record<string, string>;
  requestData?: any;
}

export enum SessionRuleType {
  FORWARD_IGNORED_HEADERS = "forwardIgnoredHeaders",
  INITIATOR_DOMAIN = "initiatorDomain",
  CSP_ERROR = "cspError",
}
