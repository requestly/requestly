import { ReducerKeys } from "store/constants";
import { logsAdapter } from "./slice";
import { RootState } from "store/types";

const storeKey = ReducerKeys.DESKTOP_TRAFFIC_TABLE;
const selectors = logsAdapter.getSelectors((state: any) => state[storeKey]["logs"]);

export const getAllLogs = selectors.selectAll;

export const getLogResponseById = (id: string) => (state: any) => {
  return state[storeKey]["responses"][id];
};

export const getAllFilters = (state: RootState) => {
  return state[storeKey].filters;
};
