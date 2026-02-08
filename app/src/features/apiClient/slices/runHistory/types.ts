import { RunResult } from "../common/runResults";

export enum RunHistorySaveStatus {
  IDLE = "idle",
  SAVING = "saving",
  SUCCESS = "success",
  FAILED = "failed",
}

export type RunHistoryEntry = {
  collectionId: string;
  history: RunResult[];
  status: RunHistorySaveStatus;
  error: string | null;
};
