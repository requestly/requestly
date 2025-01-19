import { expose } from "comlink";
import { RQ } from "../../sandbox/RQ";
import { LocalScope } from "modules/localScope";
import { ScriptExecutionWorkerInterface } from "./scriptExecutionWorkerInterface";
import { StateUpdateCallback } from "../../workload-manager/workLoadTypes";

export class ScriptExecutionWorker implements ScriptExecutionWorkerInterface {
  private localScope: LocalScope;

  executeScript(script: string, initialState: any, callback: StateUpdateCallback) {
    this.localScope = new LocalScope(initialState, callback);

    // eslint-disable-next-line no-new-func
    const scriptFunction = new Function(
      "rq",
      `
      "use strict";
      ${script}
      `
    );
    scriptFunction(new RQ(this.localScope));
  }

  async flushPendingWork() {
    const pendingWork = this.localScope.getPendingCallbackExecutions();
    await Promise.all(pendingWork);
  }
}

expose(new ScriptExecutionWorker());
