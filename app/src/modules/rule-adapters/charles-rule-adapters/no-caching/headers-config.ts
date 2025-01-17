import { HeaderRule } from "@requestly/shared/types/entities/rules";
import { Header, HeaderValue } from "../types";

export const headersConfig = {
  requestHeaders: [
    {
      header: Header.PRAGMA,
      type: HeaderRule.HeaderRuleActionType.ADD,
      value: HeaderValue.NO_CACHE,
    },
    {
      header: Header.CACHE_CONTROL,
      type: HeaderRule.HeaderRuleActionType.ADD,
      value: HeaderValue.NO_CACHE,
    },
    {
      header: Header.IF_MODIFIED_SINCE,
      type: HeaderRule.HeaderRuleActionType.REMOVE,
      value: HeaderValue.UNKNOWN,
    },
    {
      header: Header.IF_NONE_MATCH,
      type: HeaderRule.HeaderRuleActionType.REMOVE,
      value: HeaderValue.UNKNOWN,
    },
  ],

  responseHeaders: [
    {
      header: Header.CACHE_CONTROL,
      value: HeaderValue.NO_CACHE,
      type: HeaderRule.HeaderRuleActionType.ADD,
    },
    {
      header: Header.EXPIRES,
      type: HeaderRule.HeaderRuleActionType.REMOVE,
      value: HeaderValue.UNKNOWN,
    },
    {
      header: Header.LAST_MODIFIED,
      type: HeaderRule.HeaderRuleActionType.REMOVE,
      value: HeaderValue.UNKNOWN,
    },
    {
      header: Header.ETAG,
      type: HeaderRule.HeaderRuleActionType.REMOVE,
      value: HeaderValue.UNKNOWN,
    },
  ],
};
