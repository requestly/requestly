import { expose } from "comlink";
import { RQ } from "../../sandbox/RQ";
import { LocalScope } from "../../../../../../../modules/localScope";
import { ScriptExecutionWorkerInterface } from "./scriptExecutionWorkerInterface";
import {
  ScriptExecutionError,
  ScriptPendingWorkFlushingError,
  ScriptWorkloadCallback,
} from "../../workload-manager/workLoadTypes";
import { TestResult } from "../../sandbox/types";

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
      await this.syncLocalDump(callback);
    } catch (error) {
      throw new ScriptPendingWorkFlushingError(error);
    }
  }

  async getTestExecutionResults() {
    return this.testResults;
  }

  private async syncLocalDump(callback: ScriptWorkloadCallback) {
    if (!this.localScope.getIsStateMutated()) {
      return;
    }
    const dump = this.localScope.getAll();
    await callback(dump);
  }
}

expose(new ScriptExecutionWorker());
