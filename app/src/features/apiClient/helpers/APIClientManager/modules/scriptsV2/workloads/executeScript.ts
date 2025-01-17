import { expose } from "comlink";
import { LocalScopeManager, StateUpdateCallback } from "modules/worker/localScopeManager";
import { RQ } from "../sandbox/RQ";

let localScope: LocalScopeManager;

const executeScript = (script: string, initialState: any, callback: StateUpdateCallback) => {
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

  scriptFunction(sandbox.rq);
};

const syncSnapshot = () => {
  if (!localScope) {
    return undefined;
  }
  return localScope.getAll();
};

expose({ executeScript, syncSnapshot });
