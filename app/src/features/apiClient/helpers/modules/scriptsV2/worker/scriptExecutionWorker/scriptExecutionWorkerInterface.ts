import { StateUpdateCallback } from "../../workload-manager/workLoadTypes";

export interface ScriptExecutionWorkerInterface {
  executeScript(script: string, initialState: any, callback: StateUpdateCallback): void;
  flushPendingWork(): Promise<void>;
}
