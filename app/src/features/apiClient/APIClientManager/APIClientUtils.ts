import { RQAPI } from "../types";
import { requestWorkerFunction, responseWorkerFunction } from "./workerScripts";

interface EnvironmentPayload {
  key: string;
  value: any;
  currentEnvironmentId: string;
}

interface WorkerMessage {
  type: "SET_ENVIRONMENT" | "COMPLETE" | "ERROR";
  payload?: any;
}

const createWorkerCode = (fn: Function) => {
  return `
    self.onmessage = ${fn.toString()};
  `;
};

const createWorker = (workerFn: Function) => {
  const workerCode = createWorkerCode(workerFn);
  const blob = new Blob([workerCode], { type: "application/javascript" });
  return new Worker(URL.createObjectURL(blob));
};

const handleSetEnvironment = async (
  environmentManager: any,
  { key, value, currentEnvironmentId }: EnvironmentPayload
) => {
  const currentVars = environmentManager.getCurrentEnvironmentVariables();
  const newVars = {
    ...currentVars,
    [key]: {
      syncValue: value,
      localValue: value,
    },
  };
  await environmentManager.setVariables(currentEnvironmentId, newVars);
};

const cleanupWorker = (worker: Worker | null) => {
  if (worker) {
    worker.terminate();
  }
};

const messageHandler = async (worker: Worker, environmentManager: any, event: MessageEvent, resolve: any) => {
  const { type, payload } = event.data as WorkerMessage;

  switch (type) {
    case "SET_ENVIRONMENT":
      await handleSetEnvironment(environmentManager, payload);
      break;

    case "COMPLETE":
      cleanupWorker(worker);
      resolve();
      break;

    case "ERROR":
      cleanupWorker(worker);
      break;
  }
};

export const executePrerequestScript = (script: string, request: RQAPI.Request, environmentManager: any) => {
  let worker: Worker | null = null;

  return new Promise((resolve, reject) => {
    worker = createWorker(requestWorkerFunction);

    worker.onmessage = (event: MessageEvent) => messageHandler(worker, environmentManager, event, resolve);

    worker.onerror = (error) => {
      cleanupWorker(worker);
      console.error("Request Worker error:", error);
      reject();
    };

    const { currentEnvironmentId } = environmentManager.getCurrentEnvironment();
    const currentVars = environmentManager.getCurrentEnvironmentVariables();

    worker.postMessage({
      script,
      request: request,
      currentVars,
      currentEnvironmentId,
    });

    setTimeout(() => {
      cleanupWorker(worker);
    }, 35000);
  });
};

export const executePostresponseScript = (script: string, responseBody: any, environmentManager: any) => {
  let worker: Worker | null = null;

  return new Promise((resolve, reject) => {
    worker = createWorker(responseWorkerFunction);

    worker.onmessage = (event: MessageEvent) => messageHandler(worker, environmentManager, event, resolve);

    worker.onerror = (error) => {
      console.error("Response Worker error:", error);
      cleanupWorker(worker);
      reject();
    };

    const { currentEnvironmentId } = environmentManager.getCurrentEnvironment();
    const currentVars = environmentManager.getCurrentEnvironmentVariables();

    worker.postMessage({
      script,
      response: responseBody.response,
      currentVars,
      currentEnvironmentId,
    });

    setTimeout(() => {
      cleanupWorker(worker);
    }, 35000);
  });
};
