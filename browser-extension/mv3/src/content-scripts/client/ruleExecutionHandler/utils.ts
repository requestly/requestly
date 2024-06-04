import { EXTENSION_MESSAGES } from "common/constants";

export const getExecutedRules = async () => {
  return chrome.runtime.sendMessage({
    action: EXTENSION_MESSAGES.GET_EXECUTED_RULES,
  });
};
