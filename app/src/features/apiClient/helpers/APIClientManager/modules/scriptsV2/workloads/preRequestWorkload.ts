import { expose } from "comlink";
import { LocalScopeManager, StateUpdateCallback } from "modules/worker/localScopeManager";
import { SandboxAPI } from "./types";

const executePreRequestScript = (script: string, initialState: any, callback: StateUpdateCallback) => {
  const localScope = new LocalScopeManager(initialState, callback);

  const sandbox: { rq: SandboxAPI } = {
    rq: {
      environment: {
        set: (key: string, value: any) => {
          if (key === undefined || value === undefined) {
            throw new Error("Key or value is undefined while setting environment variable.");
          }
          const currentVars = localScope.get("environment");

          localScope.set("environment", {
            ...currentVars,
            [key]:
              key in currentVars
                ? { ...currentVars[key], localValue: value }
                : { localValue: value, syncValue: value, type: typeof value },
          });
        },
        get: (key: string) => {
          const vars = localScope.get("environment");
          return vars[key]?.localValue || vars[key]?.syncValue;
        },
        unset: (key: string) => {
          const vars = localScope.get("environment");
          const { [key]: _, ...rest } = vars;
          localScope.set("environment", rest);
        },
      },
      globals: {
        set: (key: string, value: any) => {
          if (key === undefined || value === undefined) {
            throw new Error("Key or value is undefined while setting global variable.");
          }
          const currentVars = localScope.get("global");

          localScope.set("global", {
            ...currentVars,
            [key]:
              key in currentVars
                ? { ...currentVars[key], localValue: value }
                : { localValue: value, syncValue: value, type: typeof value },
          });
        },
        get: (key: string) => {
          const vars = localScope.get("global");
          return vars[key]?.localValue || vars[key]?.syncValue;
        },
        unset: (key: string) => {
          const vars = localScope.get("global");
          const { [key]: _, ...rest } = vars;
          localScope.set("global", rest);
        },
      },
      collectionVariables: {
        set: (key: string, value: any) => {
          if (key === undefined || value === undefined) {
            throw new Error("Key or value is undefined while setting collection variable.");
          }
          const currentVars = localScope.get("collectionVariables");

          localScope.set("collectionVariables", {
            ...currentVars,
            [key]:
              key in currentVars
                ? { ...currentVars[key], localValue: value }
                : { localValue: value, syncValue: value, type: typeof value },
          });
        },
        get: (key: string) => {
          const vars = localScope.get("collectionVariables");
          return vars[key]?.localValue || vars[key]?.syncValue;
        },
        unset: (key: string) => {
          const vars = localScope.get("collectionVariables");
          const { [key]: _, ...rest } = vars;
          localScope.set("collectionVariables", rest);
        },
      },
    },
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

expose({ executePreRequestScript });
