import { HeaderRuleActionType } from "types";
import { Header, HeaderValue } from "../types";

export const headersConfig = {
  requestHeaders: [
    {
      header: Header.COOKIE,
      value: HeaderValue.UNKNOWN,
      type: HeaderRuleActionType.REMOVE,
    },
  ],

  responseHeaders: [
    {
      header: Header.SET_COOKIE,
      value: HeaderValue.UNKNOWN,
      type: HeaderRuleActionType.REMOVE,
    },
  ],
};
