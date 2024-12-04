import { EnvironmentVariables } from "backend/environment/types";
import { RQAPI } from "../../../../types";
import { requestWorkerFunction, responseWorkerFunction } from "./workerScripts";
import { ScriptExecutedPayload } from "./types";

interface WorkerMessage {
  type: "SCRIPT_EXECUTED" | "COMPLETE" | "ERROR";
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
    mutations: ScriptExecutedPayload["mutations"];
    currentVariables: EnvironmentVariables;
  }
) => {
  const currentVars = payload.currentVariables;
  const currentEnvironmentId = environmentManager.getCurrentEnvironment().currentEnvironmentId;

  const variablesToSet = {
    ...currentVars,
    ...Object.fromEntries(
      Object.entries(payload.mutations.environment.$set).map(([key, value]) => [
        key,
        {
          syncValue: value,
          localValue: value,
        },
      ])
    ),
  };

  Object.keys(payload.mutations.environment.$unset).forEach((key) => {
    delete variablesToSet[key];
  });

  if (!currentEnvironmentId) {
    throw new Error("No environment available to access the variables.Please select an environment.");
  }

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

const messageHandler = async (
  worker: Worker,
  environmentManager: any,
  event: MessageEvent,
  resolve: any,
  reject: any
) => {
  const { type, payload } = event.data as WorkerMessage;

  switch (type) {
    case "SCRIPT_EXECUTED": {
      handleEnvironmentChanges(environmentManager, payload)
        .then((updatedVariables) => {
          resolve(updatedVariables);
        })
        .catch((e) => {
          reject(e);
        })
        .finally(() => {
          cleanupWorker(worker);
        });
      break;
    }

    case "ERROR": {
      cleanupWorker(worker);
      reject(payload);
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

    worker.onmessage = (event: MessageEvent) => messageHandler(worker, environmentManager, event, resolve, reject);

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
  currentEnvironmentVariables: Record<string, string | number | boolean>
) => {
  let worker: Worker | null = null;

  return new Promise((resolve, reject) => {
    worker = createWorker(responseWorkerFunction);

    worker.onmessage = (event: MessageEvent) => messageHandler(worker, environmentManager, event, resolve, reject);

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
    }, 50000);
  });
};
