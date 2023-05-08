import { HeaderRuleActionType } from "types";

export const headersConfig = {
  requestHeaders: [
    {
      header: "Cookie",
      value: "",
      type: HeaderRuleActionType.REMOVE,
    },
  ],

  responseHeaders: [
    {
      header: "Set-Cookie",
      value: "",
      type: HeaderRuleActionType.REMOVE,
    },
  ],
};
