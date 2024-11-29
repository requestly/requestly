import { ReducerKeys } from "store/constants";
import { RootState } from "store/types";
import { UserAuth } from "./types";

// TODO: Make "user" as a separate slice
export const getUserAuthDetails = (state: RootState): UserAuth => {
  return state[ReducerKeys.GLOBAL]["user"];
};
