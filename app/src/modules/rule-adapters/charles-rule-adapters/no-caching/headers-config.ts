import { HeaderRule } from "@requestly/shared/types/entities/rules";
import { Header, HeaderValue } from "../types";

export const headersConfig = {
  requestHeaders: [
    {
      header: Header.PRAGMA,
      type: HeaderRule.ModificationType.ADD,
      value: HeaderValue.NO_CACHE,
    },
    {
      header: Header.CACHE_CONTROL,
      type: HeaderRule.ModificationType.ADD,
      value: HeaderValue.NO_CACHE,
    },
    {
      header: Header.IF_MODIFIED_SINCE,
      type: HeaderRule.ModificationType.REMOVE,
      value: HeaderValue.UNKNOWN,
    },
    {
      header: Header.IF_NONE_MATCH,
      type: HeaderRule.ModificationType.REMOVE,
      value: HeaderValue.UNKNOWN,
    },
  ],

  responseHeaders: [
    {
      header: Header.CACHE_CONTROL,
      value: HeaderValue.NO_CACHE,
      type: HeaderRule.ModificationType.ADD,
    },
    {
      header: Header.EXPIRES,
      type: HeaderRule.ModificationType.REMOVE,
      value: HeaderValue.UNKNOWN,
    },
    {
      header: Header.LAST_MODIFIED,
      type: HeaderRule.ModificationType.REMOVE,
      value: HeaderValue.UNKNOWN,
    },
    {
      header: Header.ETAG,
      type: HeaderRule.ModificationType.REMOVE,
      value: HeaderValue.UNKNOWN,
    },
  ],
};
