import { ScriptWorkloadCallback } from "../../../workloadManager/workLoadTypes";
import { TestResult } from "../types";

export interface ScriptExecutionWorkerInterface {
  executeScript(script: string, initialState: any, callback: ScriptWorkloadCallback): Promise<void>;
  getTestExecutionResults(): Promise<TestResult[]>;
}
