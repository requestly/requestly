import type {
  BaseRequestExecutionResult,
  Iteration,
  IterationDetails,
  RunMetadata,
  Timestamp,
  RunStatus,
} from "../common/runResults/types";

export type { RunStatus, RunMetadata, Timestamp };

export type LiveIterationMap = Map<Iteration, IterationDetails>;

export type CurrentlyExecutingRequest =
  | null
  | (BaseRequestExecutionResult & {
      startTime: Timestamp;
    });

export interface LiveRunResultSummary extends RunMetadata {
  runStatus: RunStatus;
  iterations: LiveIterationMap;
}
