import { ReducerKeys } from "store/constants";
import { RootState } from "store/types";
import { GlobalModals } from "./types";

// TODO: Make "user" as a separate slice
export const getActiveModals = (state: RootState): GlobalModals => {
  return state[ReducerKeys.GLOBAL]["activeModals"];
};
