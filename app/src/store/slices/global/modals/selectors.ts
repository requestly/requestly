import { ReducerKeys } from "store/constants";
import { RootState } from "store/types";
import { GlobalModals } from "./types";

export const getActiveModals = (state: RootState): GlobalModals => {
  return state[ReducerKeys.GLOBAL]["activeModals"];
};
