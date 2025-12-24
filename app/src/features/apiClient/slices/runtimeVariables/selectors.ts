import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "store/types";
import { ReducerKeys } from "store/constants";

const selectRuntimeVariablesSlice = (state: RootState) => state[ReducerKeys.RUNTIME_VARIABLES];

export const selectRuntimeVariablesEntity = createSelector(
  selectRuntimeVariablesSlice,
  (slice) => slice.entity
);

export const selectRuntimeVariables = createSelector(
  selectRuntimeVariablesEntity,
  (entity) => entity?.variables ?? {}
);

