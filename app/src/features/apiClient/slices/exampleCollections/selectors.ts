import { RootState } from "store/types";

export const selectIsNudgePermanentlyClosed = (state: RootState) => state.exampleCollections.isNudgePermanentlyClosed;

export const selectIsImporting = (state: RootState) => state.exampleCollections.importStatus.type === "IMPORTING";

export const selectShouldShowNudge = (state: RootState, uid: string | undefined): boolean => {
  const { isNudgePermanentlyClosed, importStatus } = state.exampleCollections;

  if (!uid) return false;
  if (isNudgePermanentlyClosed) return false;
  if (importStatus.type === "IMPORTED") return false;

  return true;
};
