/* eslint-disable no-new-func */

import { ScriptExecutedPayload } from "./types";

export const requestWorkerFunction = function (e: MessageEvent) {
  const { script, request, currentVariables } = e.data;

  const mutations: ScriptExecutedPayload["mutations"] = {
    environment: {
      $set: {},
      $unset: {},
    },
  };

  const sandbox = {
    rq: {
      request,
      environment: {
        set: (key: string, value: any) => {
          mutations.environment.$set[key] = value;
        },
        get: (key: string) => {
          const variable = currentVariables[key];
          return variable?.localValue || variable?.syncValue;
        },
        remove: (key: string) => {
          mutations.environment.$unset[key] = "";
        },
      },
    },
  };

  try {
    const scriptFunction = new Function(
      "rq",
      `
      "use strict";
      return (async () => {
      try {
        console.log('Executing script');
        ${script}
      } catch (error) {
        console.error('Script error:', error);
        throw error;
      }
      })();
      `
    );

    scriptFunction(sandbox.rq).then(() => {
      this.postMessage({
        type: "SCRIPT_EXECUTED",
        payload: {
          currentVariables,
          mutations,
        },
      });
    });
  } catch (error) {
    this.postMessage({
      type: "ERROR",
      payload: {
        name: "Script Execution",
        passed: false,
        error: error.message,
      },
    });
  }
};

export const responseWorkerFunction = function (e: MessageEvent) {
  const { script, request, response, currentVariables } = e.data;

  const mutations: ScriptExecutedPayload["mutations"] = {
    environment: {
      $set: {},
      $unset: {},
    },
  };

  const sandbox = {
    rq: {
      request,
      response,
      environment: {
        set: (key: string, value: any) => {
          mutations.environment.$set[key] = value;
        },
        get: (key: string) => {
          const variable = currentVariables[key];
          return variable?.localValue || variable?.syncValue;
        },
        remove: (key: string) => {
          mutations.environment.$unset[key] = "";
        },
      },
    },
  };

  try {
    const scriptFunction = new Function(
      "rq",
      `
      "use strict";
      return (async () => {
      try {
        console.log('Executing script');
        ${script}
      } catch (error) {
        console.error('Script error:', error);
        throw error;
      }
      })();
      `
    );

    scriptFunction(sandbox.rq).then(() => {
      this.postMessage({
        type: "SCRIPT_EXECUTED",
        payload: {
          currentVariables,
          mutations,
        },
      });
    });
  } catch (error) {
    this.postMessage({
      type: "ERROR",
      payload: {
        name: "Script Execution",
        passed: false,
        error: error.message,
      },
    });
  }
};
