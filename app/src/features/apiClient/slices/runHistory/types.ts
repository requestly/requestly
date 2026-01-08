import type { IterationDetails, RunMetadata, RunStatus } from "../common/runResults/types";

export enum HistorySaveStatus {
  IDLE = "idle",
  SAVING = "saving",
  SUCCESS = "success",
  FAILED = "failed",
}

export type PersistedIterationList = IterationDetails[];

export interface RunHistoryEntry extends RunMetadata {
  runStatus: RunStatus.COMPLETED | RunStatus.CANCELLED;
  iterations: PersistedIterationList;
}
