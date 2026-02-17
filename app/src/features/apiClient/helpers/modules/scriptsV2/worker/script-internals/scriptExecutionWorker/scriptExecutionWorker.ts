import { expose } from "comlink";
import {
  ScriptExecutionError,
  ScriptPendingWorkFlushingError,
  ScriptWorkloadCallback,
} from "../../../workloadManager/workLoadTypes";
import { RQ } from "../RQmethods";
import { ScriptContext, ScriptExecutionWorkerInterface } from "./scriptExecutionWorkerInterface";
import { LocalScope, LocalScopeInitialState } from "../../../../../../../../modules/localScope";
import { TestResult } from "../types";
import { globals, getGlobalScript } from "./globals";

export class ScriptExecutionWorker implements ScriptExecutionWorkerInterface {
  private localScope: LocalScope;
  private testResults: TestResult[] = [];
  private executionMetadata: ScriptContext["executionMetadata"];
  private executionContext: ScriptContext["executionContext"];

  private getGlobals() {
    const rq = new RQ(
      {
        localScope: this.localScope,
        executionMetadata: this.executionMetadata,
        iterationData: this.executionContext.iterationData,
      },
      this.testResults
    );
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

  async executeScript(userScript: string, scriptContext: ScriptContext, callback: ScriptWorkloadCallback) {
    const { executionContext, executionMetadata } = scriptContext;

    const localScopeInitialState: LocalScopeInitialState = {
      collectionVariables: executionContext.collectionVariables,
      environment: executionContext.environment,
      global: executionContext.global,
      request: executionContext.request,
      response: executionContext.response,
      variables: executionContext.variables,
    };
    this.localScope = new LocalScope(localScopeInitialState);
    this.executionMetadata = executionMetadata;
    this.executionContext = executionContext;

    const { globalObject, globalScript } = this.getGlobals();
    // eslint-disable-next-line no-new-func
    const scriptFunction = new Function(
      "globals",
      `
      "use strict";
      ${globalScript}
      try {
      return (async () => {
        ${userScript}
      })();
      } catch (error) {
        console.error(\`\${error.name}: \${error.message}\`);
        throw error;
      }
      `
    ) as (globals: Record<string, any>) => void;
    try {
      await scriptFunction(globalObject);
    } catch (error) {
      throw new ScriptExecutionError(typeof error === "string" ? new Error(error) : error);
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
