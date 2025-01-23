import { expose } from "comlink";
import { RQ } from "../../sandbox/RQ";
import { LocalScope } from "../../../../../../../modules/localScope";
import { ScriptExecutionWorkerInterface } from "./scriptExecutionWorkerInterface";
import {
  ScriptExecutionError,
  ScriptPendingWorkFlushingError,
  SyncLocalDumpCallback,
} from "../../workload-manager/workLoadTypes";

export class ScriptExecutionWorker implements ScriptExecutionWorkerInterface {
  private localScope: LocalScope;

  async executeScript(script: string, initialState: any, callback: SyncLocalDumpCallback) {
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
      scriptFunction(new RQ(this.localScope));
    } catch (error) {
      throw new ScriptExecutionError(error);
    }
    try {
      await this.syncLocalDump(callback);
    } catch (error) {
      throw new ScriptPendingWorkFlushingError(error);
    }
  }

  private async syncLocalDump(callback: SyncLocalDumpCallback) {
    if (!this.localScope.getIsStateMutated()) {
      return;
    }
    const dump = this.localScope.getAll();
    await callback(dump);
  }
}

expose(new ScriptExecutionWorker());
