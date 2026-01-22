import type { ApiClientStoreState } from "../workspaceView/helpers/ApiClientContextRegistry/types";
import { EntityNotFound, UpdateCommand } from "../types";
import { ApiClientEntityType } from "./types";
import { ApiClientEntity, ApiClientEntityMeta } from "./base";
import { createEmptyRunEntry, liveRunResultsActions, liveRunResultsAdapter } from "../liveRunResults/slice";
import type { CurrentlyExecutingRequest, LiveIterationMap, RunMetadata, Timestamp } from "../liveRunResults/types";
import type { RQAPI } from "features/apiClient/types";
import type { RequestExecutionResult } from "../common/runResults/types";
import { RunStatus } from "../common/runResults/types";

export interface LiveRunResultRecord extends RunMetadata {
  id: RQAPI.CollectionRecord["id"]; // collectionId
  iterations: LiveIterationMap;
  currentlyExecutingRequest: CurrentlyExecutingRequest;
  abortController: AbortController;
  error?: Error;
}

export class LiveRunResultEntity<M extends ApiClientEntityMeta = ApiClientEntityMeta> extends ApiClientEntity<
  LiveRunResultRecord,
  M
> {
  readonly type = ApiClientEntityType.LIVE_RUN_RESULT;

  dispatchCommand(command: UpdateCommand<LiveRunResultRecord>): void {
    throw new Error("LiveRunResultEntity does not support dispatchCommand. Use specific methods instead.");
  }

  upsert(params: LiveRunResultRecord): void {
    throw new Error("LiveRunResultEntity does not support upsert. Use startRun instead.");
  }

  getName(): string {
    return "liveRunResult";
  }

  getEntityFromState(state: ApiClientStoreState): LiveRunResultRecord {
    const liveRunResultsState = state.liveRunResults;
    if (!liveRunResultsState) {
      throw new EntityNotFound(this.id, "liveRunResults state");
    }

    const result = liveRunResultsAdapter.getSelectors().selectById(liveRunResultsState, this.id);

    if (!result) {
      return createEmptyRunEntry(this.id);
      // throw new EntityNotFound(this.id, "Live run result not found");
    }

    return result;
  }

  dispatchUnsafePatch(patcher: (result: LiveRunResultRecord) => void): void {
    throw new Error("LiveRunResultEntity does not support unsafePatch. Use specific methods instead.");
  }

  // Core run lifecycle methods

  startRun(params: { configId: string; startTime?: Timestamp }): void {
    this.dispatch(
      liveRunResultsActions.startRun({
        collectionId: this.id,
        startTime: params?.startTime,
      })
    );
  }

  setRunStatus(status: RunStatus, error?: Error | null): void {
    this.dispatch(
      liveRunResultsActions.setRunStatus({
        collectionId: this.id,
        status,
        error,
      })
    );
  }

  setCurrentlyExecutingRequest(request: CurrentlyExecutingRequest): void {
    this.dispatch(
      liveRunResultsActions.setCurrentlyExecutingRequest({
        collectionId: this.id,
        request,
      })
    );
  }

  addIterationResult(result: RequestExecutionResult): void {
    this.dispatch(
      liveRunResultsActions.addIterationResult({
        collectionId: this.id,
        result,
      })
    );
  }

  finalizeRun(params: {
    status: Extract<RunStatus, "completed" | "errored" | "cancelled">;
    endTime?: Timestamp;
    error?: Error | null;
  }): void {
    this.dispatch(
      liveRunResultsActions.finalizeRun({
        collectionId: this.id,
        ...params,
      })
    );
  }

  resetRun(): void {
    this.dispatch(
      liveRunResultsActions.resetRun({
        collectionId: this.id,
      })
    );
  }

  cancelRun(params?: { reason?: Error; cancelledAt?: Timestamp }): void {
    this.dispatch(
      liveRunResultsActions.cancelRun({
        collectionId: this.id,
        reason: params?.reason,
        cancelledAt: params?.cancelledAt,
      })
    );
  }

  delete(): void {
    this.resetRun();
  }

  getRunStatus(state: ApiClientStoreState): RunStatus {
    return this.getEntityFromState(state).runStatus;
  }

  getStartTime(state: ApiClientStoreState): Timestamp | null {
    return this.getEntityFromState(state).startTime;
  }

  getEndTime(state: ApiClientStoreState): Timestamp | null {
    return this.getEntityFromState(state).endTime;
  }

  getIterations(state: ApiClientStoreState): LiveIterationMap {
    return this.getEntityFromState(state).iterations;
  }

  getCurrentlyExecutingRequest(state: ApiClientStoreState): CurrentlyExecutingRequest {
    return this.getEntityFromState(state).currentlyExecutingRequest;
  }

  getAbortController(state: ApiClientStoreState): AbortController {
    return this.getEntityFromState(state).abortController;
  }

  getError(state: ApiClientStoreState): Error | undefined {
    return this.getEntityFromState(state).error;
  }

  isRunning(state: ApiClientStoreState): boolean {
    return this.getRunStatus(state) === "running";
  }

  isCompleted(state: ApiClientStoreState): boolean {
    return this.getRunStatus(state) === "completed";
  }

  isCancelled(state: ApiClientStoreState): boolean {
    return this.getRunStatus(state) === "cancelled";
  }

  isErrored(state: ApiClientStoreState): boolean {
    return this.getRunStatus(state) === "errored";
  }

  isIdle(state: ApiClientStoreState): boolean {
    return this.getRunStatus(state) === "idle";
  }

  getDuration(state: ApiClientStoreState): number | null {
    const entity = this.getEntityFromState(state);
    if (entity.startTime === null) {
      return null;
    }
    const endTime = entity.endTime ?? Date.now();
    return endTime - entity.startTime;
  }

  getIterationCount(state: ApiClientStoreState): number {
    return this.getIterations(state).size;
  }

  getTotalRequestsExecuted(state: ApiClientStoreState): number {
    const iterations = this.getIterations(state);
    let total = 0;
    iterations.forEach((iteration) => {
      total += iteration.result.length;
    });
    return total;
  }

  getRunSummary(state: ApiClientStoreState) {
    try {
      const entity = this.getEntityFromState(state);
      return {
        startTime: entity.startTime,
        endTime: entity.endTime,
        runStatus: entity.runStatus,
        iterations: entity.iterations,
      };
    } catch (e) {
      return {
        startTime: null,
        endTime: null,
        runStatus: RunStatus.IDLE,
        iterations: new Map(),
      };
    }
  }
}
