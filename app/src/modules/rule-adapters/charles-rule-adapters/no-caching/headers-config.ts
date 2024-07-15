import { HeaderRuleActionType } from "types";
import { Header, HeaderValue } from "../types";

export const headersConfig = {
  requestHeaders: [
    {
      header: Header.PRAGMA,
      type: HeaderRuleActionType.ADD,
      value: HeaderValue.NO_CACHE,
    },
    {
      header: Header.CACHE_CONTROL,
      type: HeaderRuleActionType.ADD,
      value: HeaderValue.NO_CACHE,
    },
    {
      header: Header.IF_MODIFIED_SINCE,
      type: HeaderRuleActionType.REMOVE,
      value: HeaderValue.UNKNOWN,
    },
    {
      header: Header.IF_NONE_MATCH,
      type: HeaderRuleActionType.REMOVE,
      value: HeaderValue.UNKNOWN,
    },
  ],

  responseHeaders: [
    {
      header: Header.CACHE_CONTROL,
      value: HeaderValue.NO_CACHE,
      type: HeaderRuleActionType.ADD,
    },
    {
      header: Header.EXPIRES,
      type: HeaderRuleActionType.REMOVE,
      value: HeaderValue.UNKNOWN,
    },
    {
      header: Header.LAST_MODIFIED,
      type: HeaderRuleActionType.REMOVE,
      value: HeaderValue.UNKNOWN,
    },
    {
      header: Header.ETAG,
      type: HeaderRuleActionType.REMOVE,
      value: HeaderValue.UNKNOWN,
    },
  ],
};
