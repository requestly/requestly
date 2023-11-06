import { ReducerKeys } from "store/constants";
import { RulesState, rulesAdapter } from "./slice";

const storeKey = ReducerKeys.RULES;
const rulesEntitySelectors = rulesAdapter.getSelectors((state: any) => state[storeKey]["ruleObjs"]);

// TODO: define global state type
export const getRulesState = (state: any) => {
  return state[storeKey] as RulesState;
};

export const getRuleActiveModals = (state: any) => {
  return getRulesState(state)["ruleActiveModals"];
};

export const getAllRuleObjs = rulesEntitySelectors.selectAll;
