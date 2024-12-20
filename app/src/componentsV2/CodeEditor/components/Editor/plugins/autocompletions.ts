import { autocompletion, CompletionResult, CompletionSource } from "@codemirror/autocomplete";
import { EnvironmentVariables } from "backend/environment/types";

// @nsr STATIC LIST WILL BE REMOVED BEFORE MERGING
// reference APIClientManager/modules/scripts/workerScripts.ts
export const SANDBOX = {
  rq: {
    request: "request",
    environment: "directly update or get environment variables",
    collectionVariables: "collectionVariables",
    cookies: "cookie",
    execution: "execution",
    expect: "expect",
    globals: "globals",
    info: "info",
    iterationData: "iterationData",
    require: "require",
    sendRequest: "sendRequest",
    test: "test",
    variables: "variables",
    vault: "vault",
    visualizer: "visualizer",
  },
};

function varCompletionSource(envVariables: EnvironmentVariables): CompletionSource {
  const varComplete = Object.keys(envVariables).map((key) => {
    return {
      label: key,
      detail: (envVariables[key].localValue ?? envVariables[key].syncValue) as string,
      // type: envVariables[key].type as string,
      type: envVariables[key].localValue ? "local variable" : "sync variable",
    };
  });
  console.log("varComplete", varComplete);
  return (context) => {
    const regex = /\{\{.*?/g;
    console.log("varCompletionSource context", context.state.doc.toString());
    const match = context.matchBefore(regex);
    console.log("varCompletionSource match", match);
    if (match) {
      return {
        from: 2,
        options: varComplete,
        filter: false,
      } as CompletionResult;
    }
  };
}

function sandboxCompletionSource(sandboxItems: typeof SANDBOX): CompletionSource {
  const sandboxComplete = Object.keys(sandboxItems.rq).map((key) => {
    return {
      label: key,
      // @ts-expect-error
      detail: sandboxItems.rq[key],
      type: "sandbox",
    };
  });
  console.log("sandboxComplete", sandboxComplete);
  return (context) => {
    const regex = /rq\..*?/g;
    const match = context.matchBefore(regex);
    console.log("sandboxCompletionSource match", match);
    if (match) {
      return {
        from: 3,
        options: sandboxComplete,
        filter: false,
      } as CompletionResult;
    }
  };
}

// fix-me: remove static type
export function customCompletions(envVariables: EnvironmentVariables, sandboxItems: typeof SANDBOX) {
  return autocompletion({
    activateOnTyping: true,
    override: [varCompletionSource(envVariables), sandboxCompletionSource(sandboxItems)],
  });
}
