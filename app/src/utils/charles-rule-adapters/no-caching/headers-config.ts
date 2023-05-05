import { HeaderRuleActionType } from "types";

// enum Headers {
//   PRAGMA = "Pragma",
//   CACHE_CONTROL = "Cache-Control",
//   IF_MODIFIED_SINCE = "If-Modified-Since",
//   IF_NONE_MATCH = "If-None-Match",
//   EXPIRES = "Expires",
//   LAST_MODIFIED = "Last-Modified",
//   ETAG = "ETag",
// }

export const headersConfig = {
  requestHeaders: [
    {
      header: "Pragma",
      value: "no-cache",
      type: HeaderRuleActionType.ADD,
    },
    {
      header: "Cache-Control",
      value: "no-cache",
      type: HeaderRuleActionType.ADD,
    },
    {
      header: "If-Modified-Since",
      type: HeaderRuleActionType.REMOVE,
      value: "",
    },
    {
      header: "If-None-Match",
      type: HeaderRuleActionType.REMOVE,
      value: "",
    },
  ],

  responseHeaders: [
    {
      header: "Cache-Control",
      value: "no-cache",
      type: HeaderRuleActionType.ADD,
    },
    {
      header: "Expires",
      type: HeaderRuleActionType.REMOVE,
      value: "",
    },
    {
      header: "Last-Modified",
      type: HeaderRuleActionType.REMOVE,
      value: "",
    },
    {
      header: "ETag",
      type: HeaderRuleActionType.REMOVE,
      value: "",
    },
  ],
};
