import { useMemo } from "react";
import { useApiClientSelector } from "../hooks/base.hooks";
import type { RQAPI } from "features/apiClient/types";
import type { RunHistoryEntry } from "./types";
import type { HistorySaveStatus } from "./types";
import type { RunHistoryListStatus } from "./slice";
import {
  selectCollectionHistory,
  selectCollectionHistoryById,
  selectCollectionHistoryStatus,
  selectCollectionHistoryError,
  selectCollectionHistoryCount,
  selectIsCollectionHistoryLoading,
  selectIsCollectionHistoryLoaded,
  selectHasCollectionHistoryError,
  selectLatestHistoryEntry,
  selectHistorySaveStatus,
  selectHistorySaveError,
  selectIsHistorySaving,
  selectIsHistorySaveSuccess,
  selectIsHistorySaveFailed,
  makeSelectCollectionHistory,
  makeSelectCollectionHistoryStatus,
} from "./selectors";

// Collection history hooks
export function useCollectionHistory(collectionId: RQAPI.CollectionRecord["id"]): RunHistoryEntry[] {
  return useApiClientSelector((state) => selectCollectionHistory(state, collectionId));
}

export function useCollectionHistoryById(
  collectionId: RQAPI.CollectionRecord["id"],
  historyId: string
): RunHistoryEntry | null {
  return useApiClientSelector((state) => selectCollectionHistoryById(state, collectionId, historyId));
}

export function useCollectionHistoryStatus(collectionId: RQAPI.CollectionRecord["id"]): RunHistoryListStatus {
  return useApiClientSelector((state) => selectCollectionHistoryStatus(state, collectionId));
}

export function useCollectionHistoryError(collectionId: RQAPI.CollectionRecord["id"]): string | null {
  return useApiClientSelector((state) => selectCollectionHistoryError(state, collectionId));
}

export function useCollectionHistoryCount(collectionId: RQAPI.CollectionRecord["id"]): number {
  return useApiClientSelector((state) => selectCollectionHistoryCount(state, collectionId));
}

export function useIsCollectionHistoryLoading(collectionId: RQAPI.CollectionRecord["id"]): boolean {
  return useApiClientSelector((state) => selectIsCollectionHistoryLoading(state, collectionId));
}

export function useIsCollectionHistoryLoaded(collectionId: RQAPI.CollectionRecord["id"]): boolean {
  return useApiClientSelector((state) => selectIsCollectionHistoryLoaded(state, collectionId));
}

export function useHasCollectionHistoryError(collectionId: RQAPI.CollectionRecord["id"]): boolean {
  return useApiClientSelector((state) => selectHasCollectionHistoryError(state, collectionId));
}

export function useLatestHistoryEntry(collectionId: RQAPI.CollectionRecord["id"]): RunHistoryEntry | null {
  return useApiClientSelector((state) => selectLatestHistoryEntry(state, collectionId));
}

// History save status hooks
export function useHistorySaveStatus(): HistorySaveStatus {
  return useApiClientSelector(selectHistorySaveStatus);
}

export function useHistorySaveError(): string | null {
  return useApiClientSelector(selectHistorySaveError);
}

export function useIsHistorySaving(): boolean {
  return useApiClientSelector(selectIsHistorySaving);
}

export function useIsHistorySaveSuccess(): boolean {
  return useApiClientSelector(selectIsHistorySaveSuccess);
}

export function useIsHistorySaveFailed(): boolean {
  return useApiClientSelector(selectIsHistorySaveFailed);
}

// Optimized hooks using memoized selectors
export function useCollectionHistoryOptimized(collectionId: RQAPI.CollectionRecord["id"]): RunHistoryEntry[] {
  const selector = useMemo(() => makeSelectCollectionHistory(collectionId), [collectionId]);
  return useApiClientSelector(selector);
}

export function useCollectionHistoryStatusOptimized(collectionId: RQAPI.CollectionRecord["id"]): RunHistoryListStatus {
  const selector = useMemo(() => makeSelectCollectionHistoryStatus(collectionId), [collectionId]);
  return useApiClientSelector(selector);
}

// Compound hooks for common use cases
export function useCollectionHistoryState(collectionId: RQAPI.CollectionRecord["id"]) {
  const history = useCollectionHistory(collectionId);
  const status = useCollectionHistoryStatus(collectionId);
  const error = useCollectionHistoryError(collectionId);
  const count = useCollectionHistoryCount(collectionId);
  const isLoading = useIsCollectionHistoryLoading(collectionId);
  const isLoaded = useIsCollectionHistoryLoaded(collectionId);
  const hasError = useHasCollectionHistoryError(collectionId);

  return {
    history,
    status,
    error,
    count,
    isLoading,
    isLoaded,
    hasError,
  };
}

export function useHistorySaveState() {
  const status = useHistorySaveStatus();
  const error = useHistorySaveError();
  const isSaving = useIsHistorySaving();
  const isSuccess = useIsHistorySaveSuccess();
  const isFailed = useIsHistorySaveFailed();

  return {
    status,
    error,
    isSaving,
    isSuccess,
    isFailed,
  };
}
