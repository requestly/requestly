import { TestResult } from "../../sandbox/types";
import { ScriptWorkloadCallback } from "../../workload-manager/workLoadTypes";

export interface ScriptExecutionWorkerInterface {
  executeScript(script: string, initialState: any, callback: ScriptWorkloadCallback): Promise<void>;
  getTestExecutionResults(): Promise<TestResult[]>;
}
