/* eslint-disable no-new-func */

import { EnvironmentVariables } from "backend/environment/types";

export const requestWorkerFunction = function (e: MessageEvent) {
  const { script, request, currentVariables } = e.data;

  const variableSaverQueue: EnvironmentVariables = {};
  const variableRemoverQueue: string[] = [];

  const sandbox = {
    rq: {
      request,
      environment: {
        set: (key: string, value: any) => {
          variableSaverQueue[key] = {
            localValue: value,
            syncValue: value,
            type: typeof value,
          };
        },
        get: (key: string) => {
          const variable = currentVariables[key];
          return variable?.localValue || variable?.syncValue;
        },
        remove: (key: string) => {
          variableRemoverQueue.push(key);
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
        type: "HANDLE_ENVIRONMENT_CHANGES",
        payload: {
          currentVariables,
          variablesToSet: variableSaverQueue,
          variablesToRemove: variableRemoverQueue,
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
  const { script, response, currentVariables } = e.data;

  const variableSaverQueue: EnvironmentVariables = {};
  const variableRemoverQueue: string[] = [];

  const sandbox = {
    rq: {
      response,
      environment: {
        set: (key: string, value: any) => {
          variableSaverQueue[key] = {
            localValue: value,
            syncValue: value,
            type: typeof value,
          };
        },
        get: (key: string) => {
          const variable = currentVariables[key];
          return variable?.localValue || variable?.syncValue;
        },
        remove: (key: string) => {
          variableRemoverQueue.push(key);
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
        type: "HANDLE_ENVIRONMENT_CHANGES",
        payload: {
          currentVariables,
          variablesToSet: variableSaverQueue,
          variablesToRemove: variableRemoverQueue,
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
