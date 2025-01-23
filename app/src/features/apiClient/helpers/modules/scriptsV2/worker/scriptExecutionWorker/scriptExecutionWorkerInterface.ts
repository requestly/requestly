import { SyncLocalDumpCallback } from "../../workload-manager/workLoadTypes";

export interface ScriptExecutionWorkerInterface {
  executeScript(script: string, initialState: any, callback: SyncLocalDumpCallback): Promise<void>;
}
