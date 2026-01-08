import { createSlice, createEntityAdapter, PayloadAction, EntityState } from "@reduxjs/toolkit";
import { NativeError } from "errors/NativeError";
import type {
  CurrentlyExecutingRequest,
  RequestExecutionResult,
  RunMetadata,
  RunStatus,
  Timestamp,
  Iteration,
  IterationDetails,
} from "../common/runResults/types";
import { RunStatusStateMachine } from "../common/runResults/utils";
import { RunStatus as RunStatusEnum } from "../common/runResults/types";
import { API_CLIENT_LIVE_RUN_RESULTS_SLICE_NAME } from "../common/constants";
import type { RQAPI } from "features/apiClient/types";
import { EntityNotFound } from "../types";

export interface LiveRunEntryState extends RunMetadata {
  id: RQAPI.CollectionRecord["id"];
  iterations: Map<Iteration, IterationDetails>;
  currentlyExecutingRequest: CurrentlyExecutingRequest;
  abortController: AbortController;
  error?: Error;
}

export const liveRunResultsAdapter = createEntityAdapter<LiveRunEntryState>({
  selectId: (entry) => entry.id,
});

export interface LiveRunResultsSliceState extends EntityState<LiveRunEntryState> {}

const initialState: LiveRunResultsSliceState = liveRunResultsAdapter.getInitialState();

export class InvalidLiveRunStateTransition extends NativeError {}

export const createEmptyRunEntry = (collectionId: RQAPI.CollectionRecord["id"]): LiveRunEntryState => ({
  id: collectionId,
  startTime: null,
  endTime: null,
  runStatus: RunStatusEnum.IDLE,
  iterations: new Map(),
  currentlyExecutingRequest: null,
  abortController: new AbortController(),
  error: undefined,
});

const assertTransition = (current: RunStatus, next: RunStatus) => {
  const allowed = RunStatusStateMachine[current] as readonly RunStatus[];
  if (!allowed?.includes(next)) {
    throw new InvalidLiveRunStateTransition(`Invalid run state change from ${current} to ${next}`);
  }
};

export const liveRunResultsSlice = createSlice({
  name: API_CLIENT_LIVE_RUN_RESULTS_SLICE_NAME,
  initialState,
  reducers: {
    startRun(
      state,
      action: PayloadAction<{
        collectionId: RQAPI.CollectionRecord["id"];
        startTime?: Timestamp;
      }>
    ) {
      const { collectionId, startTime } = action.payload;

      const entry: LiveRunEntryState = {
        ...createEmptyRunEntry(collectionId),
        startTime: startTime ?? Date.now(),
        runStatus: RunStatusEnum.RUNNING,
      };

      liveRunResultsAdapter.setOne(state, entry);
    },

    setRunStatus(
      state,
      action: PayloadAction<{
        collectionId: RQAPI.CollectionRecord["id"];
        status: RunStatus;
        error?: Error | null;
      }>
    ) {
      const { collectionId, status, error } = action.payload;
      const entry = state.entities[collectionId];
      if (!entry) {
        throw new EntityNotFound(collectionId, "Collection not found!");
      }

      assertTransition(entry.runStatus, status);

      entry.runStatus = status;
      entry.error = status === RunStatusEnum.ERRORED ? error ?? undefined : undefined;
    },

    setCurrentlyExecutingRequest(
      state,
      action: PayloadAction<{
        collectionId: RQAPI.CollectionRecord["id"];
        request: CurrentlyExecutingRequest;
      }>
    ) {
      const { collectionId, request } = action.payload;
      const entry = state.entities[collectionId];
      if (!entry) {
        throw new EntityNotFound(collectionId, "Collection not found!");
      }

      entry.currentlyExecutingRequest = request;
    },

    addIterationResult(
      state,
      action: PayloadAction<{
        collectionId: RQAPI.CollectionRecord["id"];
        result: RequestExecutionResult;
      }>
    ) {
      const { collectionId, result } = action.payload;
      const entry = state.entities[collectionId];
      if (!entry) {
        throw new EntityNotFound(collectionId, "Collection not found!");
      }

      const iterationBucket = entry.iterations.get(result.iteration);

      if (!iterationBucket) {
        entry.iterations.set(result.iteration, { result: [result] });
      } else {
        iterationBucket.result.push(result);
      }
    },

    finalizeRun(
      state,
      action: PayloadAction<{
        collectionId: RQAPI.CollectionRecord["id"];
        status: Extract<RunStatus, RunStatusEnum.COMPLETED | RunStatusEnum.ERRORED | RunStatusEnum.CANCELLED>;
        endTime?: Timestamp;
        error?: Error | null;
      }>
    ) {
      const { collectionId, status, endTime, error } = action.payload;
      const entry = state.entities[collectionId];
      if (!entry) {
        throw new EntityNotFound(collectionId, "Collection not found!");
      }

      assertTransition(entry.runStatus, status);

      entry.runStatus = status;
      entry.endTime = endTime ?? Date.now();
      entry.currentlyExecutingRequest = null;
      entry.error = status === RunStatusEnum.ERRORED ? error ?? undefined : undefined;
    },

    resetRun(
      state,
      action: PayloadAction<{
        collectionId: RQAPI.CollectionRecord["id"];
      }>
    ) {
      const { collectionId } = action.payload;
      liveRunResultsAdapter.setOne(state, createEmptyRunEntry(collectionId));
    },

    cancelRun(
      state,
      action: PayloadAction<{
        collectionId: RQAPI.CollectionRecord["id"];
        reason?: Error;
        cancelledAt?: Timestamp;
      }>
    ) {
      const { collectionId, reason, cancelledAt } = action.payload;
      const entry = state.entities[collectionId];

      if (!entry) {
        throw new EntityNotFound(collectionId, "Collection not found!");
      }

      assertTransition(entry.runStatus, RunStatusEnum.CANCELLED);

      entry.abortController.abort();
      entry.runStatus = RunStatusEnum.CANCELLED;
      entry.endTime = cancelledAt ?? Date.now();
      entry.currentlyExecutingRequest = null;
      entry.error = reason;
    },

    clearAll(state) {
      liveRunResultsAdapter.removeAll(state);
    },
  },
});

export const liveRunResultsActions = liveRunResultsSlice.actions;
export const liveRunResultsReducer = liveRunResultsSlice.reducer;
export const liveRunResultsAdapterSelectors = liveRunResultsAdapter.getSelectors();
