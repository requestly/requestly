import { ReducerKeys } from "store/constants";
import { storageRecordAdapter } from "./slice";

const storeKey = ReducerKeys.RULES;
const rulesEntitySelectors = storageRecordAdapter.getSelectors((state: any) => state[storeKey]["records"]);

export const getAllRecords = rulesEntitySelectors.selectAll;
export const getAllRecordsMap = rulesEntitySelectors.selectEntities;
export const getAllRecordIds = rulesEntitySelectors.selectIds;
