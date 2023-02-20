import { Request, Response, Header, QueryString } from "har-format";

export enum ColorScheme {
  DARK = "dark",
  LIGHT = "light",
}

export type NetworkEvent = chrome.devtools.network.Request & {
  _resourceType?: string;
};
export type NetworkRequest = Request;
export type NetworkResponse = Response;
export type NetworkHeader = Header;
export type NetworkRequestQueryParam = QueryString;

export enum RuleEditorUrlFragment {
  HEADERS = "Headers",
}

export enum ResourceTypeFilter {
  ALL = "all",
  AJAX = "ajax",
  JS = "js",
  CSS = "css",
  IMG = "img",
  MEDIA = "media",
  FONT = "font",
  DOC = "doc",
  WS = "ws",
  WASM = "wasm",
  MANIFEST = "manifest",
  OTHER = "other",
}

export interface NetworkFilters {
  url?: string;
  resourceType?: ResourceTypeFilter;
}
