/* eslint-disable no-new-func */

import { EnvironmentVariables } from "backend/environment/types";

function executeScript(
  scriptParams: { script: string; rqSandbox: Record<string, any> },
  variableHelpers: Record<string, any>
) {
  const scriptFunction = new Function(
    "rq",
    `
      "use strict";
      return (async () => {
      try {
        console.log('Executing script');
        ${scriptParams.script}
      } catch (error) {
        console.error('Script error:', error);
        throw error;
      }
      })();
      `
  );

  try {
    scriptFunction(scriptParams.rqSandbox.rq).then(() => {
      this.postMessage({
        type: "HANDLE_ENVIRONMENT_CHANGES",
        payload: {
          currentVariables: variableHelpers.currentVariables,
          variablesToSet: variableHelpers.variableSaverQueue,
          variablesToRemove: variableHelpers.variableRemoverQueue,
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
}

const rqEnvironmentSandbox = (
  currentVariables: EnvironmentVariables,
  variableSaverQueue: EnvironmentVariables,
  variableRemoverQueue: string[]
) => ({
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
  unset: (key: string) => {
    variableRemoverQueue.push(key);
  },
});

export const requestWorkerFunction = function (e: MessageEvent) {
  const { script, request, currentVariables } = e.data;

  const variableSaverQueue: EnvironmentVariables = {};
  const variableRemoverQueue: string[] = [];

  const sandbox = {
    rq: {
      request,
      environment: rqEnvironmentSandbox(currentVariables, variableSaverQueue, variableRemoverQueue),
    },
  };

  executeScript(
    { script, rqSandbox: sandbox },
    {
      currentVariables,
      variableSaverQueue,
      variableRemoverQueue,
    }
  );
};

export const responseWorkerFunction = function (e: MessageEvent) {
  const { script, response, currentVariables } = e.data;

  const variableSaverQueue: EnvironmentVariables = {};
  const variableRemoverQueue: string[] = [];

  const sandbox = {
    rq: {
      response,
      environment: rqEnvironmentSandbox(currentVariables, variableSaverQueue, variableRemoverQueue),
    },
  };

  executeScript(
    { script, rqSandbox: sandbox },
    {
      currentVariables,
      variableSaverQueue,
      variableRemoverQueue,
    }
  );
};
