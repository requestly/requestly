import { expose } from "comlink";
import {
  ScriptExecutionError,
  ScriptPendingWorkFlushingError,
  ScriptWorkloadCallback,
} from "../../../workloadManager/workLoadTypes";
import { RQ } from "../RQmethods";
import { ScriptExecutionWorkerInterface } from "./scriptExecutionWorkerInterface";
import { InitialState, LocalScope } from "../../../../../../../../modules/localScope";
import { TestResult } from "../types";
import { globals, getGlobalScript } from "./globals";

export class ScriptExecutionWorker implements ScriptExecutionWorkerInterface {
  private localScope: LocalScope;
  private testResults: TestResult[] = [];

  private getGlobals() {
    const rq = new RQ(this.localScope, this.testResults);
    const responseCode = {
      code: rq.response?.code,
    };
    const responseBody = rq.response?.body;
    const globalObject = {
      ...globals,
      rq,
      responseCode,
      responseBody,
    };

    const globalScript = getGlobalScript(globalObject);

    return {
      globalObject,
      globalScript,
    };
  }

  async executeScript(userScript: string, initialState: InitialState, callback: ScriptWorkloadCallback) {
    this.localScope = new LocalScope(initialState);
    const { globalObject, globalScript } = this.getGlobals();
    // eslint-disable-next-line no-new-func
    const scriptFunction = new Function(
      "globals",
      `
      "use strict";
      ${globalScript}
      try {
        ${userScript}
      } catch (error) {
        console.error(\`\${error.name}: \${error.message}\`);
        throw error;
      }
      `
    ) as (globals: Record<string, any>) => void;
    try {
      scriptFunction(globalObject);
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
