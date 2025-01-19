import { StateUpdateCallback } from "modules/localScope";

export interface ScriptExecutionWorkerInterface {
  executeScript(script: string, initialState: any, callback: StateUpdateCallback): void;
  syncSnapshot(onStateUpdate: (key: string, value: any) => void): void;
}
