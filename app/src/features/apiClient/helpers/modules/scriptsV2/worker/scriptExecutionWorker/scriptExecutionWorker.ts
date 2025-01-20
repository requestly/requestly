import { expose } from "comlink";
import { RQ } from "../../sandbox/RQ";
import { LocalScope } from "modules/localScope";
import { ScriptExecutionWorkerInterface } from "./scriptExecutionWorkerInterface";
import { SyncLocalDumpCallback } from "../../workload-manager/workLoadTypes";

export class ScriptExecutionWorker implements ScriptExecutionWorkerInterface {
  private localScope: LocalScope;

  executeScript(script: string, initialState: any) {
    this.localScope = new LocalScope(initialState);

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

  async syncLocalDump(callback: SyncLocalDumpCallback) {
    if (!this.localScope.getIsStateMutated()) {
      return;
    }
    const dump = this.localScope.getAll();
    callback(dump);
  }
}

expose(new ScriptExecutionWorker());
