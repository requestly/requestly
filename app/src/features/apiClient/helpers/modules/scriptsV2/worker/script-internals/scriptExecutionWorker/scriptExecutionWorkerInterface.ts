import { ExecutionContext } from "features/apiClient/helpers/httpRequestExecutor/scriptExecutionContext";
import { ScriptWorkloadCallback } from "../../../workloadManager/workLoadTypes";
import { ExecutionArtifacts, ExecutionMetadata } from "../types";

export type ScriptContext = {
  executionContext: ExecutionContext;
  executionMetadata: ExecutionMetadata;
};

export interface ScriptExecutionWorkerInterface {
  executeScript(
    script: string,
    initialState: ScriptContext,
    callback: ScriptWorkloadCallback
  ): Promise<ExecutionArtifacts>;
}
