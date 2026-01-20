import RedirectRulePair from "./RedirectRulePair";
import CancelRulePair from "./CancelRulePair";
import ReplaceRulePair from "./ReplaceRulePair";
import HeadersRulePair from "./HeadersRulePair";
import QueryParamRulePair from "./QueryParamRulePair";
import ScriptRulePair from "./ScriptRulePair";
import ResponseRulePair from "./ResponseRulePair";
import RequestRulePair from "./RequestRulePair";
import UserAgentRulePair from "./UserAgentRulePair";
import DelayRulePair from "./DelayRulePair";
import { RuleType } from "@requestly/shared/types/entities/rules";

export const rulePairComponents = {
  [RuleType.REDIRECT]: RedirectRulePair,
  [RuleType.CANCEL]: CancelRulePair,
  [RuleType.REPLACE]: ReplaceRulePair,
  [RuleType.HEADERS]: HeadersRulePair,
  [RuleType.QUERYPARAM]: QueryParamRulePair,
  [RuleType.SCRIPT]: ScriptRulePair,
  [RuleType.RESPONSE]: ResponseRulePair,
  [RuleType.REQUEST]: RequestRulePair,
  [RuleType.USERAGENT]: UserAgentRulePair,
  [RuleType.DELAY]: DelayRulePair,
};
