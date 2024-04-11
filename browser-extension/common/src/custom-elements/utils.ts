import { RuleType } from "../types";
import cancelRuleIcon from "../../resources/icons/rule-icons/cancel.svg";
import delayRuleIcon from "../../resources/icons/rule-icons/delay.svg";
import headerRuleIcon from "../../resources/icons/rule-icons/headers.svg";
import queryParamIcon from "../../resources/icons/rule-icons/queryparam.svg";
import redirectRuleIcon from "../../resources/icons/rule-icons/redirect.svg";
import replaceRuleIcon from "../../resources/icons/rule-icons/replace.svg";
import useragentRuleIcon from "../../resources/icons/rule-icons/useragent.svg";
import scriptRuleIcon from "../../resources/icons/rule-icons/script.svg";
import responRuleIcon from "../../resources/icons/rule-icons/response.svg";
import requestRuleIcon from "../../resources/icons/rule-icons/request.svg";

export const registerCustomElement = (tagName: string, elementConstructor: CustomElementConstructor) => {
  if (!customElements.get(tagName)) {
    customElements.define(tagName, elementConstructor);
  }
};

export const setInnerHTML = (element: InnerHTML, content: string) => {
  try {
    element.innerHTML = content;
  } catch (e) {
    // @ts-ignore
    const trustedTypesPolicy = window.trustedTypes?.createPolicy?.("rq-html-policy", {
      createHTML: (html: string) => html,
    });
    element.innerHTML = trustedTypesPolicy.createHTML(content);
  }
};

export const getEpochToMMSSFormat = (epochTime: number) => {
  const date = new Date(epochTime);
  const minutes = date.getUTCMinutes().toString().padStart(2, "0");
  const seconds = date.getUTCSeconds().toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
};

export const getRuleTypeIcon = (ruleType: RuleType) => {
  switch (ruleType) {
    case RuleType.CANCEL:
      return cancelRuleIcon;
    case RuleType.DELAY:
      return delayRuleIcon;
    case RuleType.HEADERS:
      return headerRuleIcon;
    case RuleType.QUERYPARAM:
      return queryParamIcon;
    case RuleType.REDIRECT:
      return redirectRuleIcon;
    case RuleType.REPLACE:
      return replaceRuleIcon;
    case RuleType.USERAGENT:
      return useragentRuleIcon;
    case RuleType.SCRIPT:
      return scriptRuleIcon;
    case RuleType.RESPONSE:
      return responRuleIcon;
    case RuleType.REQUEST:
      return requestRuleIcon;
    default:
      return "";
  }
};
