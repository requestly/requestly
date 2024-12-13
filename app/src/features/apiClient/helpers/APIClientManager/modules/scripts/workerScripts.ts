/* eslint-disable no-new-func */

import { ScriptExecutedPayload } from "./types";

export const requestWorkerFunction = function (e: MessageEvent) {
  const { script, request, currentVariables, globalVariables } = e.data;
  console.log("!!!debug", "re worker funcrion", Object.keys(currentVariables));

  const mutations: ScriptExecutedPayload["mutations"] = {
    environment: {
      $set: {},
      $unset: {},
    },
    globals: {
      $set: {},
      $unset: {},
    },
  };

  const createInfiniteChainable = (methodName: string) => {
    let hasLogged = false;

    const handler = {
      get: () => {
        if (!hasLogged) {
          console.log(`Using unsupported method: ${methodName}`);
          hasLogged = true;
        }
        return new Proxy(() => {}, handler);
      },
      apply: () => {
        return new Proxy(() => {}, handler);
      },
    };

    return new Proxy(() => {}, handler);
  };

  console.log("!!!debug", "inside request worker", Object.keys(currentVariables));
  console.log("!!!debug", "inside reqglo worker", Object.keys(globalVariables));

  const sandbox = {
    rq: {
      request,
      environment: {
        set: (key: string, value: any) => {
          if (key === undefined || value === undefined) {
            throw new Error("Key or value is undefined while setting environment variable.");
          }
          mutations.environment.$set[key] = value;
        },
        get: (key: string) => {
          const variable = currentVariables[key];
          return variable?.localValue || variable?.syncValue;
        },
        unset: (key: string) => {
          mutations.environment.$unset[key] = "";
        },
      },
      globals: {
        set: (key: string, value: any) => {
          if (key === undefined || value === undefined) {
            throw new Error("Key or value is undefined while setting environment variable.");
          }
          mutations.globals.$set[key] = value;
        },
        get: (key: string) => {
          const variable = globalVariables[key];
          return variable?.localValue || variable?.syncValue;
        },
        unset: (key: string) => {
          mutations.globals.$unset[key] = "";
        },
      },
      collectionVariables: createInfiniteChainable("collectionVariables"),
      cookies: createInfiniteChainable("cookie"),
      execution: createInfiniteChainable("execution"),
      expect: createInfiniteChainable("expect"),
      info: createInfiniteChainable("info"),
      iterationData: createInfiniteChainable("iterationData"),
      require: createInfiniteChainable("require"),
      sendRequest: createInfiniteChainable("sendRequest"),
      test: createInfiniteChainable("test"),
      variables: createInfiniteChainable("variables"),
      vault: createInfiniteChainable("vault"),
      visualizer: createInfiniteChainable("visualizer"),
    },
  };

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

  scriptFunction(sandbox.rq)
    .then(() => {
      this.postMessage({
        type: "SCRIPT_EXECUTED",
        payload: {
          currentVariables,
          mutations,
          globalVariables,
        },
      });
    })
    .catch((error: unknown) => {
      this.postMessage({
        type: "ERROR",
        payload: {
          name: "Script Execution",
          passed: false,
          error,
        },
      });
    });
};

export const responseWorkerFunction = function (e: MessageEvent) {
  const { script, request, response, currentVariables, globalVariables } = e.data;

  const mutations: ScriptExecutedPayload["mutations"] = {
    environment: {
      $set: {},
      $unset: {},
    },
    globals: {
      $set: {},
      $unset: {},
    },
  };

  const createInfiniteChainable = (methodName: string) => {
    let hasLogged = false;

    const handler = {
      get: () => {
        if (!hasLogged) {
          console.log(`Using unsupported method: ${methodName}`);
          hasLogged = true;
        }
        return new Proxy(() => {}, handler);
      },
      apply: () => {
        return new Proxy(() => {}, handler);
      },
    };

    return new Proxy(() => {}, handler);
  };

  const sandbox = {
    rq: {
      request,
      response,
      environment: {
        set: (key: string, value: any) => {
          if (key === undefined || value === undefined) {
            throw new Error("Key or value is undefined while setting environment variable.");
          }
          mutations.environment.$set[key] = value;
        },
        get: (key: string) => {
          const variable = currentVariables[key];
          return variable?.localValue || variable?.syncValue;
        },
        unset: (key: string) => {
          mutations.environment.$unset[key] = "";
        },
      },
      globals: {
        set: (key: string, value: any) => {
          if (key === undefined || value === undefined) {
            throw new Error("Key or value is undefined while setting environment variable.");
          }
          mutations.globals.$set[key] = value;
        },
        get: (key: string) => {
          const variable = globalVariables[key];
          return variable?.localValue || variable?.syncValue;
        },
        unset: (key: string) => {
          mutations.globals.$unset[key] = "";
        },
      },
      collectionVariables: createInfiniteChainable("collectionVariables"),
      cookies: createInfiniteChainable("cookie"),
      execution: createInfiniteChainable("execution"),
      expect: createInfiniteChainable("expect"),
      info: createInfiniteChainable("info"),
      iterationData: createInfiniteChainable("iterationData"),
      require: createInfiniteChainable("require"),
      sendRequest: createInfiniteChainable("sendRequest"),
      test: createInfiniteChainable("test"),
      variables: createInfiniteChainable("variables"),
      vault: createInfiniteChainable("vault"),
      visualizer: createInfiniteChainable("visualizer"),
    },
  };

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

  scriptFunction(sandbox.rq)
    .then(() => {
      this.postMessage({
        type: "SCRIPT_EXECUTED",
        payload: {
          currentVariables,
          mutations,
        },
      });
    })
    .catch((error: unknown) => {
      this.postMessage({
        type: "ERROR",
        payload: {
          name: "Script Execution",
          passed: false,
          error,
        },
      });
    });
};
