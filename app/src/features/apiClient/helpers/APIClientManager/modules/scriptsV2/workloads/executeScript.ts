import { expose } from "comlink";
import { LocalScopeManager, StateUpdateCallback } from "modules/worker/localScopeManager";
import { RQ } from "../sandbox/RQ";

let localScope: LocalScopeManager;

const executeScript = (script: string, initialState: any, callback: StateUpdateCallback) => {
  console.log("!!!debug", "executeScript called", script, initialState, callback);
  localScope = new LocalScopeManager(initialState, callback);

  const sandbox = {
    rq: new RQ(localScope),
  };

  // eslint-disable-next-line no-new-func
  const scriptFunction = new Function(
    "rq",
    `
    "use strict";
    try {
      ${script}
    } catch (error) {
      throw error;
    }
    `
  );
  console.log("!!!debug", "scriptFunction called", sandbox.rq);
  scriptFunction(sandbox.rq);
};

const syncSnapshot = async (onStateUpdate: (key: string, value: any) => void) => {
  if (!localScope) {
    return undefined;
  }
  const localState = localScope.getAll();
  for (const key in localState) {
    onStateUpdate(key, localState[key]);
  }
};

expose({ executeScript, syncSnapshot });
