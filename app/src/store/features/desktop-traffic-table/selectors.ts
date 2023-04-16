import { ReducerKeys } from "store/constants";
import { logsAdapter } from "./slice";

const storeKey = ReducerKeys.DESKTOP_TRAFFIC_TABLE as string;
const selectors = logsAdapter.getSelectors((state: any) => state[storeKey]["logs"]);

export const getAllLogs = selectors.selectAll;

export const getLogResponseById = (id: string) => (state: any) => {
  return state[storeKey]["responses"][id];
};
