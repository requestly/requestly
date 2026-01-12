import { RootState } from "store/types";

export const selectExampleCollectionsState = (state: RootState) => state.exampleCollections;

export const selectIsNudgePermanentlyClosed = (state: RootState) => state.exampleCollections.isNudgePermanentlyClosed;

export const selectImportStatus = (state: RootState) => state.exampleCollections.importStatus;

export const selectIsImported = (state: RootState) => state.exampleCollections.importStatus.type === "IMPORTED";

export const selectIsImporting = (state: RootState) => state.exampleCollections.importStatus.type === "IMPORTING";

export const selectIsFailed = (state: RootState) => state.exampleCollections.importStatus.type === "FAILED";

export const selectIsNotImported = (state: RootState) => state.exampleCollections.importStatus.type === "NOT_IMPORTED";

export const selectShouldShowNudge = (state: RootState, uid: string | undefined): boolean => {
  const { isNudgePermanentlyClosed, importStatus } = state.exampleCollections;

  if (!uid) return false;
  if (isNudgePermanentlyClosed) return false;
  if (importStatus.type === "IMPORTED") return false;

  return true;
};

export const selectImportError = (state: RootState): string | null => {
  const status = state.exampleCollections.importStatus;
  return status.type === "FAILED" ? status.error : null;
};

export const selectImportedAt = (state: RootState): number | null => {
  const status = state.exampleCollections.importStatus;
  return status.type === "IMPORTED" ? status.importedAt : null;
};
