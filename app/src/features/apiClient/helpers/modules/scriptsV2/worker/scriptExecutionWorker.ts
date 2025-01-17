import { expose } from "comlink";
import { LocalScopeManager, StateUpdateCallback } from "modules/worker/localScopeManager";
import { RQ } from "../sandbox/RQ";

export class ScriptExecutionWorker {
  private localScope: LocalScopeManager;

  executeScript(script: string, initialState: any, callback: StateUpdateCallback) {
    console.log("!!!debug", "executeScript called", script, initialState, callback);
    this.localScope = new LocalScopeManager(initialState, callback);

    const sandbox = {
      rq: new RQ(this.localScope),
    };

    // eslint-disable-next-line no-new-func
    const scriptFunction = new Function(
      "rq",
      `
      "use strict";
      ${script}
      `
    );
    console.log("!!!debug", "scriptFunction called", sandbox.rq);
    scriptFunction(sandbox.rq);
  }

  syncSnapshot(onStateUpdate: (key: string, value: any) => void) {
    if (!this.localScope) {
      return;
    }
    const localState = this.localScope.getAll();
    for (const key in localState) {
      onStateUpdate(key, localState[key]);
    }
  }
}

expose(new ScriptExecutionWorker());
