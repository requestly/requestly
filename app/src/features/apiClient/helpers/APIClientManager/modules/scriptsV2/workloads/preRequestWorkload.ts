import { expose } from "comlink";
import { LocalScopeManager, StateUpdateCallback } from "modules/worker/localScopeManager";
import { RQ } from "../sandbox/RQ";

const executePreRequestScript = (script: string, initialState: any, callback: StateUpdateCallback) => {
  const localScope = new LocalScopeManager(initialState, callback);

  const sandbox = {
    rq: new RQ(localScope),
  };

  // eslint-disable-next-line no-new-func
  const scriptFunction = new Function(
    "rq",
    `
    "use strict";
      ${script}
    `
  );

  scriptFunction(sandbox.rq);
};

expose({ executePreRequestScript });
