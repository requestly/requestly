import { expose } from "comlink";
import { LocalScopeManager, StateUpdateCallback } from "modules/worker/localScopeManager";
import { RQ } from "../sandbox/RQ";

const executeScript = (script: string, initialState: any, callback: StateUpdateCallback) => {
  const localScope = new LocalScopeManager(initialState, callback);

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

expose({ executeScript });
