import { ReducerKeys } from "store/constants";
import { storageRecordAdapter } from "./slice";
import { isRule } from "features/rules";

const storeKey = ReducerKeys.RULES;
const rulesEntitySelectors = storageRecordAdapter.getSelectors((state: any) => state[storeKey]["records"]);

export const getAllRecords = rulesEntitySelectors.selectAll;
export const getAllRecordsMap = rulesEntitySelectors.selectEntities;
export const getAllRecordIds = rulesEntitySelectors.selectIds;

export const getAllRules = (state: any) => getAllRecords(state).filter((record) => isRule(record));
