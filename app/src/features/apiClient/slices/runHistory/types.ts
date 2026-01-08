import type { IterationDetails, RunMetadata, RunStatus } from "../common/runResults/types";
import { LiveIterationMap } from "../liveRunResults";

export enum HistorySaveStatus {
  IDLE = "idle",
  SAVING = "saving",
  SUCCESS = "success",
  FAILED = "failed",
}

export type PersistedIterationList = IterationDetails[];

export interface RunHistoryEntry extends RunMetadata {
  id: string;
  collectionId: string;
  runStatus: RunStatus.COMPLETED | RunStatus.CANCELLED;
  iterations: LiveIterationMap;
}
