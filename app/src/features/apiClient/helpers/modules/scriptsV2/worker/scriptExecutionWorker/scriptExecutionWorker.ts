import { expose } from "comlink";
import { RQ } from "../../sandbox/RQ";
import { LocalScope, StateUpdateCallback } from "modules/localScope";
import { ScriptExecutionWorkerInterface } from "./scriptExecutionWorkerInterface";

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
