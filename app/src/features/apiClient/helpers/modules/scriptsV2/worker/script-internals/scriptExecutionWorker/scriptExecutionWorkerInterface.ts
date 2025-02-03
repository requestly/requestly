import { ScriptWorkloadCallback } from "../../../workloadManager/workLoadTypes";
import { ExecutionArtifacts } from "../types";

export interface ScriptExecutionWorkerInterface {
  executeScript(script: string, initialState: any, callback: ScriptWorkloadCallback): Promise<ExecutionArtifacts>;
}
