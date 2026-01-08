import type { ApiClientStoreState } from "../workspaceView/helpers/ApiClientContextRegistry/types";
import { EntityNotFound, UpdateCommand } from "../types";
import { ApiClientEntityType } from "./types";
import { ApiClientEntity, ApiClientEntityMeta } from "./base";
import { liveRunResultsActions, liveRunResultsAdapter } from "../liveRunResults/slice";
import type {
  CollectionRunCompositeId,
  CurrentlyExecutingRequest,
  LiveIterationMap,
  RunMetadata,
  RunStatus,
  Timestamp,
} from "../liveRunResults/types";
import type { RequestExecutionResult } from "../common/runResults/types";

export interface LiveRunResultRecord extends RunMetadata {
  id: CollectionRunCompositeId;
  iterations: LiveIterationMap;
  currentlyExecutingRequest: CurrentlyExecutingRequest;
  abortController: AbortController | null;
  error: Error | null;
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
      throw new EntityNotFound(this.id, "live_run_result");
    }
    return result;
  }

  dispatchUnsafePatch(patcher: (result: LiveRunResultRecord) => void): void {
    throw new Error("LiveRunResultEntity does not support unsafePatch. Use specific methods instead.");
  }

  // Core run lifecycle methods

  startRun(params?: { startTime?: Timestamp; abortController?: AbortController }): void {
    this.dispatch(
      liveRunResultsActions.startRun({
        id: this.id as CollectionRunCompositeId,
        startTime: params?.startTime,
        abortController: params?.abortController,
      })
    );
  }

  setRunStatus(status: RunStatus, error?: Error | null): void {
    this.dispatch(
      liveRunResultsActions.setRunStatus({
        id: this.id as CollectionRunCompositeId,
        status,
        error,
      })
    );
  }

  setCurrentlyExecutingRequest(request: CurrentlyExecutingRequest): void {
    this.dispatch(
      liveRunResultsActions.setCurrentlyExecutingRequest({
        id: this.id as CollectionRunCompositeId,
        request,
      })
    );
  }

  addIterationResult(result: RequestExecutionResult): void {
    this.dispatch(
      liveRunResultsActions.addIterationResult({
        id: this.id as CollectionRunCompositeId,
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
        id: this.id as CollectionRunCompositeId,
        ...params,
      })
    );
  }

  resetRun(): void {
    this.dispatch(
      liveRunResultsActions.resetRun({
        id: this.id as CollectionRunCompositeId,
      })
    );
  }

  cancelRun(params?: { reason?: Error; cancelledAt?: Timestamp }): void {
    this.dispatch(
      liveRunResultsActions.cancelRun({
        id: this.id as CollectionRunCompositeId,
        reason: params?.reason,
        cancelledAt: params?.cancelledAt,
      })
    );
  }

  delete(): void {
    this.resetRun();
  }

  // Getter methods

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

  getAbortController(state: ApiClientStoreState): AbortController | null {
    return this.getEntityFromState(state).abortController;
  }

  getError(state: ApiClientStoreState): Error | null {
    return this.getEntityFromState(state).error;
  }

  // Computed properties

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
}
