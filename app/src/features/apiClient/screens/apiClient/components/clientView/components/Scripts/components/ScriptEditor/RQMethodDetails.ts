import { MethodDetails } from "componentsV2/CodeEditor/components/Editor/plugins/generateAutoCompletions/RQScriptMethods";

// created based on reference of APIClientManager/modules/scripts/workerScripts.ts
export const RQ_NAMESPACE_METHODS: MethodDetails[] = [
  {
    name: "request",
    docstring: "The sent request details",
    signature: "rq.request: Request",
  },
  {
    name: "response",
    docstring: "The received response details",
    signature: "rq.response: Response",
  },
  {
    name: "environment",
    docstring: "Manage environment variables",
    signature: "rq.environment: Record<string, any>",
  },
  {
    name: "collectionVariables",
    docstring: "Manage collection variables",
    signature: "rq.collectionVariables: Record<string, any>",
  },
  {
    name: "cookies",
    docstring: "Cookies Object",
    signature: "rq.cookies: Object",
  },
  {
    name: "execution",
  },
  {
    name: "expect",
  },
  {
    name: "globals",
    docstring: "Manage global variables",
    signature: "rq.globals: Record<string, any>",
  },
  {
    name: "info",
  },
  {
    name: "iterationData",
  },
  {
    name: "require",
  },
  {
    name: "sendRequest",
    docstring: "Send an async request",
    signature: "rq.sendRequest(options: XHRRequestOptions): Promise<XHRResponse>",
  },
  {
    name: "test",
    docstring: "Configure test executions",
  },
  {
    name: "variables",
    docstring: "Manage variables",
  },
  {
    name: "vault",
  },
  {
    name: "visualizer",
  },
];
