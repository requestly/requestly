import { RQAPI } from "../types";
import { requestWorkerCode, responseWorkerCode } from "./workerScripts";

interface EnvironmentPayload {
  key: string;
  value: any;
  currentEnvironmentId: string;
}

interface WorkerMessage {
  type: "SET_ENVIRONMENT" | "COMPLETE" | "ERROR";
  payload?: any;
}

const createWorker = (workerCode: string) => {
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

const messageHandler = async (worker: Worker, environmentManager: any, event: MessageEvent) => {
  const { type, payload } = event.data as WorkerMessage;

  switch (type) {
    case "SET_ENVIRONMENT":
      await handleSetEnvironment(environmentManager, payload);
      break;

    case "COMPLETE":
      cleanupWorker(worker);
      break;

    case "ERROR":
      cleanupWorker(worker);
      break;
  }
};

export const parseRequestScript = (script: string, request: RQAPI.Request, environmentManager: any) => {
  let worker: Worker | null = null;

  try {
    worker = createWorker(requestWorkerCode);

    worker.onmessage = (event: MessageEvent) => messageHandler(worker, environmentManager, event);

    worker.onerror = (error) => {
      cleanupWorker(worker);
      console.error("Request Worker error:", error);
    };

    const { currentEnvironmentId } = environmentManager.getCurrentEnvironment();
    const currentVars = environmentManager.getCurrentEnvironmentVariables();
    console.log("!!!debug", "req", request);
    worker.postMessage({
      script,
      request: request,
      currentVars,
      currentEnvironmentId,
    });

    setTimeout(() => {
      cleanupWorker(worker);
    }, 5000);
  } catch (error) {
    cleanupWorker(worker);
  }
};

export const parseResponseScript = (script: string, responseBody: any, environmentManager: any) => {
  let worker: Worker | null = null;

  try {
    worker = createWorker(responseWorkerCode);

    worker.onmessage = (event: MessageEvent) => messageHandler(worker, environmentManager, event);

    worker.onerror = (error) => {
      console.error("Response Worker error:", error);
      cleanupWorker(worker);
    };

    const { currentEnvironmentId } = environmentManager.getCurrentEnvironment();
    const currentVars = environmentManager.getCurrentEnvironmentVariables();
    console.log("!!!debug", "resp", responseBody);
    worker.postMessage({
      script,
      response: responseBody.response,
      currentVars,
      currentEnvironmentId,
    });

    setTimeout(() => {
      cleanupWorker(worker);
    }, 5000);
  } catch (error) {
    cleanupWorker(worker);
  }
};
