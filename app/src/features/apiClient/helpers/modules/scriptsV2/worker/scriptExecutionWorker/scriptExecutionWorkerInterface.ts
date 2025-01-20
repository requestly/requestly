import { SyncLocalDumpCallback } from "../../workload-manager/workLoadTypes";

export interface ScriptExecutionWorkerInterface {
  executeScript(script: string, initialState: any): void;
  syncLocalDump(callback: SyncLocalDumpCallback): void;
}
