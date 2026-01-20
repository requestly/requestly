import { Request, Response, Header, QueryString } from "har-format";
import { Rule } from "../types";
import { ResourceTypeFilterValue } from "./components/ResourceTypeFilter";

export enum ColorScheme {
  DARK = "dark",
  LIGHT = "light",
}

export enum NetworkResourceType {
  FETCH = "fetch",
  XHR = "xhr",
  JS = "script",
  CSS = "stylesheet",
  IMG = "image",
  MEDIA = "media",
  FONT = "font",
  DOC = "document",
  WEBSOCKET = "websocket",
  WASM = "wasm",
  MANIFEST = "manifest",
  OTHER = "other",
}

export type NetworkEvent = Omit<chrome.devtools.network.Request, "_resourceType"> & {
  _resourceType?: NetworkResourceType;
};
export type NetworkRequest = Request;
export type NetworkResponse = Response;
export type NetworkHeader = Header;
export type NetworkRequestQueryParam = QueryString;

export type RQNetworkEvent = NetworkEvent & {
  metadata?: Metadata;
};

interface Metadata {
  graphQLDetails: GraphQLDetails | null;
}

interface GraphQLDetails {
  query: string;
  variables: any; // TBD @nsr
  operationName: string;
}

export enum RuleEditorUrlFragment {
  HEADERS = "Headers",
  REDIRECT = "Redirect",
  REPLACE = "Replace",
  CANCEL = "Cancel",
  DELAY = "Delay",
  QUERY_PARAM = "QueryParam",
  SCRIPT = "Script",
  USER_AGENT = "UserAgent",
  REQUEST = "Request",
  RESPONSE = "Response",
}

export interface ResourceFilters {
  url?: string;
  resourceType?: ResourceTypeFilterValue;
}

export interface ExecutionFilters extends ResourceFilters {
  ruleName?: string;
}

export interface NetworkSettings {
  preserveLog: boolean;
}

export interface ExecutionEvent {
  requestURL: string;
  requestType: chrome.webRequest.ResourceType | "fetch";
  requestMethod: string;
  timestamp: number;
  rule: Rule;
  modification: string;
  _resourceType?: NetworkResourceType;
}

export enum RequestMethod {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  PATCH = "PATCH",
  DELETE = "DELETE",
  OPTIONS = "OPTIONS",
}
