import { expose } from "comlink";
import {
  ScriptExecutionError,
  ScriptPendingWorkFlushingError,
  ScriptWorkloadCallback,
} from "../../../workloadManager/workLoadTypes";
import { RQ } from "../RQmethods";
import { ScriptExecutionWorkerInterface } from "./scriptExecutionWorkerInterface";
import { LocalScope } from "../../../../../../../../modules/localScope";
import { TestResult } from "../types";

export class ScriptExecutionWorker implements ScriptExecutionWorkerInterface {
  private localScope: LocalScope;
  private testResults: TestResult[] = [];

  async executeScript(script: string, initialState: any, callback: ScriptWorkloadCallback) {
    this.localScope = new LocalScope(initialState);

    // eslint-disable-next-line no-new-func
    const scriptFunction = new Function(
      "rq",
      `
      "use strict";
      ${script}
      `
    );
    try {
      scriptFunction(new RQ(this.localScope, this.testResults));
    } catch (error) {
      throw new ScriptExecutionError(error);
    }
    try {
      this.syncLocalDump(callback);
      return {
        testResults: this.testResults,
      };
    } catch (error) {
      throw new ScriptPendingWorkFlushingError(error);
    }
  }

  private syncLocalDump(callback: ScriptWorkloadCallback) {
    if (!this.localScope.getIsStateMutated()) {
      return;
    }
    const dump = this.localScope.getAll();
    callback(dump);
  }
}

expose(new ScriptExecutionWorker());
