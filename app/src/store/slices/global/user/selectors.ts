import { ReducerKeys } from "store/constants";
import { RootState } from "store/types";
import { UserAuth } from "./types";
import { User } from "backend/models/users";

// TODO: Make "user" as a separate slice
export const getUserAuthDetails = (state: RootState): UserAuth => {
  return state[ReducerKeys.GLOBAL]["user"];
};

export const getUserMetadata = (state: RootState): User["metadata"] => {
  return state[ReducerKeys.GLOBAL]["user"].details?.metadata;
};
