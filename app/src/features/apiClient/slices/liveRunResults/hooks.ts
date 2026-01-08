import { useMemo } from "react";
import { useApiClientSelector } from "../hooks/base.hooks";
import { CollectionRunCompositeId } from "../common/runResults/types";
import {
  selectLiveRunResultById,
  selectLiveRunResultIterations,
  selectLiveRunResultStartTime,
  selectLiveRunResultRunStatus,
  selectLiveRunResultError,
  selectLiveRunResultCurrentlyExecutingRequest,
  selectLiveRunResultSummary,
} from "./selectors";
import { createSelector } from "@reduxjs/toolkit";
import { LiveRunResultSummary } from "./types";
import { LiveRunEntryState } from "./slice";
import { EntityNotFound } from "../types";

export function useLiveRunResult<T>(id: CollectionRunCompositeId, selector: (entry: LiveRunEntryState) => T): T {
  const memoizedSelector = useMemo(
    () =>
      createSelector([(state: any) => selectLiveRunResultById(state, id)], (entry) => {
        if (!entry) {
          throw new EntityNotFound(id, "Live collection run result not found!");
        }

        return selector(entry);
      }),
    [id, selector]
  );

  return useApiClientSelector(memoizedSelector);
}

export function useLiveRunResultIterations(id: CollectionRunCompositeId) {
  return useApiClientSelector((state) => selectLiveRunResultIterations(state, id));
}

export function useLiveRunResultStartTime(id: CollectionRunCompositeId) {
  return useApiClientSelector((state) => selectLiveRunResultStartTime(state, id));
}

export function useLiveRunResultRunStatus(id: CollectionRunCompositeId) {
  return useApiClientSelector((state) => selectLiveRunResultRunStatus(state, id));
}

export function useLiveRunResultError(id: CollectionRunCompositeId) {
  return useApiClientSelector((state) => selectLiveRunResultError(state, id));
}

export function useLiveRunResultCurrentlyExecutingRequest(id: CollectionRunCompositeId) {
  return useApiClientSelector((state) => selectLiveRunResultCurrentlyExecutingRequest(state, id));
}

export function useLiveRunResultSummary(id: CollectionRunCompositeId): LiveRunResultSummary {
  const summary = useApiClientSelector((state) => selectLiveRunResultSummary(state, id));

  if (!summary) {
    throw new EntityNotFound(id, "Live collection run result summary not found!");
  }

  return summary;
}
