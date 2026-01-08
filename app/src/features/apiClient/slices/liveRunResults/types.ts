import type {
  BaseRequestExecutionResult,
  Iteration,
  IterationDetails,
  RunMetadata,
  Timestamp,
  CollectionRunCompositeId,
  RunStatus,
} from "../common/runResults/types";

export type { CollectionRunCompositeId, RunStatus, RunMetadata, Timestamp };

export type LiveIterationMap = Map<Iteration, IterationDetails>;

export type CurrentlyExecutingRequest =
  | null
  | (BaseRequestExecutionResult & {
      startTime: Timestamp;
    });

export interface LiveRunResultSummary extends RunMetadata {
  runStatus: RunStatus.COMPLETED | RunStatus.CANCELLED;
  iterations: LiveIterationMap;
}
