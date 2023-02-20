import { RuleType } from "types/rules";
import { rulesData } from "./rules-data";

export const getRuleDetails = (ruleType: RuleType) => rulesData[ruleType];
