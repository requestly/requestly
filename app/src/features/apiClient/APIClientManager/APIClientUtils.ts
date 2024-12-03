import { EnvironmentVariables } from "backend/environment/types";
import { RQAPI } from "../types";
import { requestWorkerFunction, responseWorkerFunction } from "./workerScripts";

interface WorkerMessage {
  type: "HANDLE_ENVIRONMENT_CHANGES" | "COMPLETE" | "ERROR";
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

const handleEnvironmentChanges = async (
  environmentManager: any,
  payload: {
    variablesToSet: EnvironmentVariables;
    variablesToRemove: string[];
    currentVariables: EnvironmentVariables;
  }
) => {
  const currentVars = payload.currentVariables;
  const currentEnvironmentId = environmentManager.getCurrentEnvironment().currentEnvironmentId;

  const variablesToSet = {
    ...currentVars,
    ...payload.variablesToSet,
  };

  payload.variablesToRemove.forEach((key) => {
    delete variablesToSet[key];
  });

  await environmentManager.setVariables(currentEnvironmentId, variablesToSet);
  return {
    updatedVariables: variablesToSet,
  };
};

const cleanupWorker = (worker: Worker | null) => {
  if (worker) {
    worker.terminate();
  }
};

const messageHandler = async (worker: Worker, environmentManager: any, event: MessageEvent, resolve: any) => {
  const { type, payload } = event.data as WorkerMessage;

  switch (type) {
    case "HANDLE_ENVIRONMENT_CHANGES": {
      const updatedVariables = await handleEnvironmentChanges(environmentManager, payload);
      cleanupWorker(worker);
      resolve(updatedVariables);
      break;
    }

    case "ERROR": {
      cleanupWorker(worker);
      resolve(null);
      break;
    }
  }
};

export const executePrerequestScript = (
  script: string,
  request: RQAPI.Request,
  environmentManager: any
): Promise<EnvironmentVariables | null> => {
  let worker: Worker | null = null;

  return new Promise((resolve, reject) => {
    worker = createWorker(requestWorkerFunction);

    worker.onmessage = (event: MessageEvent) => messageHandler(worker, environmentManager, event, resolve);

    worker.onerror = (error) => {
      cleanupWorker(worker);
      console.error("Request Worker error:", error);
      reject();
    };

    const currentVars = environmentManager.getCurrentEnvironmentVariables();

    worker.postMessage({
      script,
      request: request,
      currentVariables: currentVars,
    });

    setTimeout(() => {
      cleanupWorker(worker);
    }, 35000);
  });
};

export const executePostresponseScript = (
  script: string,
  APIDetails: {
    request: RQAPI.Request;
    response: RQAPI.Response;
  },
  environmentManager: any,
  currentEnvironmentVariables: EnvironmentVariables
) => {
  let worker: Worker | null = null;

  return new Promise((resolve, reject) => {
    worker = createWorker(responseWorkerFunction);

    worker.onmessage = (event: MessageEvent) => messageHandler(worker, environmentManager, event, resolve);

    worker.onerror = (error) => {
      console.error("Response Worker error:", error);
      cleanupWorker(worker);
      reject();
    };

    worker.postMessage({
      script,
      request: APIDetails.request,
      response: APIDetails.response,
      currentVariables: currentEnvironmentVariables,
    });

    setTimeout(() => {
      cleanupWorker(worker);
    }, 35000);
  });
};
