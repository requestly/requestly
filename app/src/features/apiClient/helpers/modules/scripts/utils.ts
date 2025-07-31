import { EnvironmentVariables } from "backend/environment/types";
import { RQAPI } from "../../../types";
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

const handleGlobalEnvironmentMutations = async (
  environmentManager: any,
  payload: {
    mutations: ScriptExecutedPayload["mutations"];
    globalVariables: EnvironmentVariables;
  }
) => {
  const { mutations, globalVariables } = payload;

  if (isEmpty(mutations.globals.$set) && isEmpty(mutations.globals.$unset)) {
    return {
      updatedGlobalVariables: globalVariables,
    };
  }

  const variablesToSet = {
    ...globalVariables,
    ...Object.fromEntries(
      Object.entries(mutations.globals.$set).map(([key, value]) => {
        if (globalVariables[key]) {
          return [
            key,
            {
              syncValue: globalVariables[key].syncValue,
              localValue: value,
            },
          ];
        }

        return [
          key,
          {
            syncValue: value,
            localValue: value,
          },
        ];
      })
    ),
  };

  Object.keys(mutations.globals.$unset).forEach((key) => {
    delete variablesToSet[key];
  });

  await environmentManager.setVariables("global", variablesToSet);

  return {
    updatedGlobalVariables: variablesToSet,
  };
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

  if (isEmpty(payload.mutations.environment.$set) && isEmpty(payload.mutations.environment.$unset)) {
    return {
      updatedEnvironmentVariables: currentVars,
    };
  }

  const variablesToSet = {
    ...currentVars,
    ...Object.fromEntries(
      Object.entries(payload.mutations.environment.$set).map(([key, value]) => {
        if (currentVars[key]) {
          return [
            key,
            {
              syncValue: currentVars[key].syncValue,
              localValue: value,
            },
          ];
        }

        return [
          key,
          {
            syncValue: value,
            localValue: value,
          },
        ];
      })
    ),
  };

  Object.keys(payload.mutations.environment.$unset).forEach((key) => {
    delete variablesToSet[key];
  });

  if (!currentEnvironmentId) {
    throw new Error("No environment available to access the variables.");
  }

  await environmentManager.setVariables(currentEnvironmentId, variablesToSet);
  return {
    updatedEnvironmentVariables: variablesToSet,
  };
};

const handleCollectionVariablesMutations = async (
  environmentManager: any,
  requestCollectionId: string,
  payload: {
    mutations: ScriptExecutedPayload["mutations"];
    collectionVariables: EnvironmentVariables;
  }
) => {
  const { mutations, collectionVariables } = payload;

  if (isEmpty(mutations.collectionVariables.$set) && isEmpty(mutations.collectionVariables.$unset)) {
    return {
      updatedCollectionVariables: collectionVariables,
    };
  }

  const variablesToSet = {
    ...collectionVariables,
    ...Object.fromEntries(
      Object.entries(mutations.collectionVariables.$set).map(([key, value]) => {
        if (collectionVariables[key]) {
          return [
            key,
            {
              syncValue: collectionVariables[key].syncValue,
              localValue: value,
              type: typeof collectionVariables[key].syncValue,
            },
          ];
        }
        return [
          key,
          {
            syncValue: value,
            localValue: value,
            type: typeof value,
          },
        ];
      })
    ),
  };

  Object.keys(mutations.collectionVariables.$unset).forEach((key) => {
    delete variablesToSet[key];
  });

  await environmentManager.setCollectionVariables(variablesToSet, requestCollectionId);
  return {
    updatedCollectionVariables: variablesToSet,
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
  reject: any,
  requestCollectionId: string
) => {
  const { type, payload } = event.data as WorkerMessage;

  switch (type) {
    case "SCRIPT_EXECUTED": {
      Promise.all([
        handleGlobalEnvironmentMutations(environmentManager, payload),
        handleEnvironmentChanges(environmentManager, payload),
        handleCollectionVariablesMutations(environmentManager, requestCollectionId, payload),
      ])
        .then(([globalUpdates, envUpdates, collectionUpdates]) => {
          resolve({
            ...globalUpdates,
            ...envUpdates,
            ...collectionUpdates,
          });
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
  environmentManager: any,
  currentEnvironmentVariables: EnvironmentVariables,
  globalEnvironmentVariables: EnvironmentVariables,
  collectionVariables: EnvironmentVariables,
  requestCollectionId: string
): Promise<{
  updatedEnvironmentVariables: EnvironmentVariables;
  updatedGlobalVariables: EnvironmentVariables;
  updatedCollectionVariables: EnvironmentVariables;
} | null> => {
  let worker: Worker | null = null;

  return new Promise((resolve, reject) => {
    worker = createWorker(requestWorkerFunction);

    worker.onmessage = (event: MessageEvent) =>
      messageHandler(worker, environmentManager, event, resolve, reject, requestCollectionId);

    worker.onerror = (error) => {
      cleanupWorker(worker);
      console.error("Request Worker error:", error);
      reject();
    };

    worker.postMessage({
      script,
      request: request,
      currentVariables: currentEnvironmentVariables,
      globalVariables: globalEnvironmentVariables,
      collectionVariables: collectionVariables,
      collectionId: requestCollectionId,
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
  currentEnvironmentVariables: EnvironmentVariables,
  globalEnvironmentVariables: EnvironmentVariables,
  collectionVariables: EnvironmentVariables,
  requestCollectionId: string
) => {
  let worker: Worker | null = null;

  return new Promise((resolve, reject) => {
    worker = createWorker(responseWorkerFunction);

    worker.onmessage = (event: MessageEvent) =>
      messageHandler(worker, environmentManager, event, resolve, reject, requestCollectionId);

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
      globalVariables: globalEnvironmentVariables,
      collectionVariables: collectionVariables,
      collectionId: requestCollectionId,
    });

    setTimeout(() => {
      cleanupWorker(worker);
    }, 50000);
  });
};
