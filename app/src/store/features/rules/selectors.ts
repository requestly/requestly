import { ReducerKeys } from "store/constants";
import { storageRecordAdapter } from "./slice";
import { isRule } from "features/rules/utils";

const storeKey = ReducerKeys.RULES;
const rulesEntitySelectors = storageRecordAdapter.getSelectors((state: any) => state[storeKey]["records"]);

export const getAllRecords = rulesEntitySelectors.selectAll;
export const getAllRecordsMap = rulesEntitySelectors.selectEntities;
export const getAllRecordIds = rulesEntitySelectors.selectIds;
export const getRecordById = (state: any, id: string) => rulesEntitySelectors.selectById(state, id);

export const getAllRules = (state: any) => getAllRecords(state).filter((record: any) => isRule(record));

// Returns a selector that maps ids -> record.name
export const makeSelectRecordNamesByIds = (ids: string[]) => (state: any): Record<string, string> => {
  const namesById: Record<string, string> = {};
  if (Array.isArray(ids)) {
    for (const id of ids) {
      const record: any = rulesEntitySelectors.selectById(state, id);
      if (record && typeof record.name === "string") {
        namesById[id] = record.name as string;
      }
    }
  }
  return namesById;
};
