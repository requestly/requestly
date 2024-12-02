/* eslint-disable no-new-func */

export const responseWorkerFunction = function (e: MessageEvent) {
  const { script, response, currentVars, currentEnvironmentId } = e.data;

  const sandbox = {
    rq: {
      response,
      environment: {
        set: (key: string, value: any) => {
          this.postMessage({
            type: "SET_ENVIRONMENT",
            payload: { key, value, currentEnvironmentId },
          });
        },
        get: (key: string) => {
          const variable = currentVars[key];
          return variable?.localValue || variable?.syncValue;
        },
      },
    },
  };

  try {
    const scriptFunction = new Function(
      "rq",
      `
      "use strict";
      try {
        ${script}
      } catch (error) {
        console.error('Script error:', error);
        throw error;
      }
      `
    );

    scriptFunction(sandbox.rq);
    this.postMessage({ type: "COMPLETE" });
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

export const requestWorkerFunction = function (e: MessageEvent) {
  const { script, request, currentVars, currentEnvironmentId } = e.data;

  const sandbox = {
    rq: {
      request,
      environment: {
        set: (key: string, value: any) => {
          this.postMessage({
            type: "SET_ENVIRONMENT",
            payload: { key, value, currentEnvironmentId },
          });
        },
        get: (key: string) => {
          const variable = currentVars[key];
          return variable?.localValue || variable?.syncValue;
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
      this.postMessage({ type: "COMPLETE" });
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
