import { ReducerKeys } from "store/constants";
import { logsAdapter } from "./slice";
import { RootState } from "store/types";

const storeKey = ReducerKeys.DESKTOP_TRAFFIC_TABLE;
const selectors = logsAdapter.getSelectors((state: any) => state[storeKey]["logs"]);

export const getAllLogs = selectors.selectAll;

export const getAllResponses = (state: RootState) => {
  return state[storeKey]["responses"];
};

export const getLogResponseById = (id: string) => (state: RootState) => {
  return getAllResponses(state)[id];
};

export const getAllFilters = (state: RootState) => {
  return state[storeKey].filters;
};

export const getIsInterceptionPaused = (state: RootState) => {
  return state[storeKey].isInterceptionPaused;
};

export const selectSelectedLogId = (state: RootState) => {
  return state[storeKey].selectedLogId;
};
