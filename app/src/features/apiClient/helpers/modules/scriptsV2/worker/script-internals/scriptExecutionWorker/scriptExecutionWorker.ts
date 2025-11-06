import { expose } from "comlink";
import {
  ScriptExecutionError,
  ScriptPendingWorkFlushingError,
  ScriptWorkloadCallback,
} from "../../../workloadManager/workLoadTypes";
import { RQ } from "../RQmethods";
import { ScriptContext, ScriptExecutionWorkerInterface } from "./scriptExecutionWorkerInterface";
import { LocalScope } from "../../../../../../../../modules/localScope";
import { TestResult } from "../types";

export class ScriptExecutionWorker implements ScriptExecutionWorkerInterface {
  private localScope: LocalScope;
  private testResults: TestResult[] = [];

  async executeScript(script: string, scriptContext: ScriptContext, callback: ScriptWorkloadCallback) {
    const { executionContext, executionMetadata } = scriptContext;

    this.localScope = new LocalScope(executionContext);

    // eslint-disable-next-line no-new-func
    const scriptFunction = new Function(
      "rq",
      `
      "use strict";
      ${script}
      `
    );
    try {
      scriptFunction(new RQ(this.localScope, this.testResults, executionMetadata));
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

  private async syncLocalDump(callback: ScriptWorkloadCallback) {
    const isStateMutated = this.localScope.getIsStateMutated();
    const dump = this.localScope.getAll();
    if (isStateMutated) {
      await callback(dump);
    }
  }
}

expose(new ScriptExecutionWorker());
