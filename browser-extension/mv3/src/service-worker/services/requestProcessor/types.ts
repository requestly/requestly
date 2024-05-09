export interface AJAXRequestDetails {
  url: string;
  method: string;
  type: "xmlhttprequest" | "fetch";
  initiatorDomain: string;
  requestHeaders: Record<string, string>;
}

export enum SessionRuleType {
  AUTH_HEADER = "auth_header",
}
