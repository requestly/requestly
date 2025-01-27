import { HeaderRule } from "@requestly/shared/types/entities/rules";
import { Header, HeaderValue } from "../types";

export const headersConfig = {
  requestHeaders: [
    {
      header: Header.COOKIE,
      value: HeaderValue.UNKNOWN,
      type: HeaderRule.ModificationType.REMOVE,
    },
  ],

  responseHeaders: [
    {
      header: Header.SET_COOKIE,
      value: HeaderValue.UNKNOWN,
      type: HeaderRule.ModificationType.REMOVE,
    },
  ],
};
