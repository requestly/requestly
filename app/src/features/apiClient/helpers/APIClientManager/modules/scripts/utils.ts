import { EnvironmentVariables, VariableKeyValuePairs } from "backend/environment/types";
import { RQAPI } from "../../../../types";
import { requestWorkerFunction, responseWorkerFunction } from "./workerScripts";
import { ScriptExecutedPayload } from "./types";
import { isEmpty } from "lodash";

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

const handleVariableChanges = async (
  payload: {
    mutations: ScriptExecutedPayload["mutations"];
    currentVariables: EnvironmentVariables;
  },
  helperMethods?: any
) => {
  console.log("!!!debug", "payload", {
    payload,
    helperMethods,
  });
  const currentVars = payload.currentVariables;
  const currentEnvironmentId = helperMethods.currentEnvironmentId;

  if (isEmpty(payload.mutations.environment.$set) && isEmpty(payload.mutations.environment.$unset)) {
    return {
      updatedVariables: currentVars,
    };
  }

  const variablesToUpsert = { ...payload.mutations.environment.$set };

  Object.keys(payload.mutations.environment.$unset).forEach((key) => {
    delete variablesToUpsert[key];
  });

  if (!currentEnvironmentId) {
    throw new Error("No environment available to access the variables.");
  }

  return helperMethods.setVariables(variablesToUpsert);
};

const cleanupWorker = (worker: Worker | null) => {
  if (worker) {
    worker.terminate();
  }
};

const messageHandler = async (worker: Worker, event: MessageEvent, resolve: any, reject: any, helperMethods?: any) => {
  const { type, payload } = event.data as WorkerMessage;

  switch (type) {
    case "SCRIPT_EXECUTED": {
      handleVariableChanges(payload, helperMethods)
        .then(() => {
          resolve();
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
      reject(payload.error);
    }
  }
};

export const executePrerequestScript = (
  script: string,
  request: RQAPI.Request,
  currentEnvironmentVariables: VariableKeyValuePairs,
  currentEnvironmentId: string,
  setVariables: (variables: VariableKeyValuePairs) => Promise<void>
): Promise<EnvironmentVariables | null> => {
  let worker: Worker | null = null;

  return new Promise((resolve, reject) => {
    worker = createWorker(requestWorkerFunction);

    const helperMethods = {
      currentEnvironmentId,
      setVariables,
    };

    worker.onmessage = (event: MessageEvent) => messageHandler(worker, event, resolve, reject, helperMethods);

    worker.onerror = (error) => {
      cleanupWorker(worker);
      console.error("Request Worker error:", error);
      reject();
    };

    worker.postMessage({
      script,
      request: request,
      currentVariables: currentEnvironmentVariables,
      currentEnvironmentId,
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
  currentEnvironmentVariables: VariableKeyValuePairs,
  currentEnvironmentId: string,
  setVariables: (variables: VariableKeyValuePairs) => Promise<void>
) => {
  let worker: Worker | null = null;

  return new Promise((resolve, reject) => {
    worker = createWorker(responseWorkerFunction);

    const helperMethods = {
      currentEnvironmentId,
      setVariables,
    };

    worker.onmessage = (event: MessageEvent) => messageHandler(worker, event, resolve, reject, helperMethods);

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
      currentEnvironmentId,
    });

    setTimeout(() => {
      cleanupWorker(worker);
    }, 50000);
  });
};
