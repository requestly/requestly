import { ReducerKeys } from "store/constants";
import { rulesAdapter } from "./slice";

const storeKey = ReducerKeys.RULES;
const rulesEntitySelectors = rulesAdapter.getSelectors((state: any) => state[storeKey]["ruleObjs"]);

export const getAllRuleObjs = rulesEntitySelectors.selectAll;
export const getAllRuleObjMap = rulesEntitySelectors.selectEntities;
export const getAllRuleObjIds = rulesEntitySelectors.selectIds;
