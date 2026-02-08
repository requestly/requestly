import { useMemo } from "react";
import { useApiClientSelector } from "../hooks/base.hooks";
import { RQAPI } from "features/apiClient/types";
import {
  selectLiveRunResultByCollectionId,
  selectLiveRunResultIterations,
  selectLiveRunResultStartTime,
  selectLiveRunResultRunStatus,
  selectLiveRunResultError,
  selectLiveRunResultCurrentlyExecutingRequest,
  selectLiveRunResultSummary,
} from "./selectors";
import { LiveRunEntryState } from "./slice";
import { createSelector } from "@reduxjs/toolkit";
import { EntityNotFound } from "../types";
import { LiveRunResultSummary } from "./types";

export function useLiveRunResult<T>(
  collectionId: RQAPI.CollectionRecord["id"],
  selector: (entry: LiveRunEntryState) => T
): T {
  const memoizedSelector = useMemo(
    () =>
      createSelector([(state: any) => selectLiveRunResultByCollectionId(state, collectionId)], (entry) => {
        if (!entry) {
          throw new EntityNotFound(collectionId, "Live collection run result not found!");
        }

        return selector(entry);
      }),
    [collectionId, selector]
  );

  return useApiClientSelector(memoizedSelector);
}

export function useLiveRunResultIterations(collectionId: RQAPI.CollectionRecord["id"]) {
  return useApiClientSelector((state) => selectLiveRunResultIterations(state, collectionId));
}

export function useLiveRunResultStartTime(collectionId: RQAPI.CollectionRecord["id"]) {
  return useApiClientSelector((state) => selectLiveRunResultStartTime(state, collectionId));
}

export function useLiveRunResultRunStatus(collectionId: RQAPI.CollectionRecord["id"]) {
  return useApiClientSelector((state) => selectLiveRunResultRunStatus(state, collectionId));
}

export function useLiveRunResultError(collectionId: RQAPI.CollectionRecord["id"]) {
  return useApiClientSelector((state) => selectLiveRunResultError(state, collectionId));
}

export function useLiveRunResultCurrentlyExecutingRequest(collectionId: RQAPI.CollectionRecord["id"]) {
  return useApiClientSelector((state) => selectLiveRunResultCurrentlyExecutingRequest(state, collectionId));
}

export function useLiveRunResultSummary(collectionId: RQAPI.CollectionRecord["id"]): LiveRunResultSummary {
  const summary = useApiClientSelector((state) => selectLiveRunResultSummary(state, collectionId));

  if (!summary) {
    throw new EntityNotFound(collectionId, "Live collection run result summary not found!");
  }

  return summary;
}
