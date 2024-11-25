import { responseWorkerCode } from "./workerScripts";

// types.ts
interface EnvironmentPayload {
  key: string;
  value: any;
  currentEnvironmentId: string;
}

interface WorkerMessage {
  type: "SET_ENVIRONMENT" | "COMPLETE" | "ERROR";
  payload?: any;
}

// scriptParser.ts
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

export const parseResponseScript = (script: string, responseBody: any, environmentManager: any): Promise<any> => {
  let worker: Worker | null = null;
  let timeoutId: NodeJS.Timeout;

  return new Promise((resolve, reject) => {
    try {
      worker = createWorker(responseWorkerCode);

      worker.onmessage = async (event) => {
        const { type, payload } = event.data as WorkerMessage;

        switch (type) {
          case "SET_ENVIRONMENT":
            await handleSetEnvironment(environmentManager, payload);
            break;

          case "COMPLETE":
            clearTimeout(timeoutId);
            cleanupWorker(worker);
            resolve(null);
            break;

          case "ERROR":
            clearTimeout(timeoutId);
            cleanupWorker(worker);
            resolve(payload);
            break;
        }
      };

      worker.onerror = (error) => {
        clearTimeout(timeoutId);
        cleanupWorker(worker);
        resolve({
          name: "Worker Error",
          passed: false,
          error: error.message,
        });
      };

      const { currentEnvironmentId } = environmentManager.getCurrentEnvironment();
      const currentVars = environmentManager.getCurrentEnvironmentVariables();
      console.log("!!!debug", "resp", responseBody);
      worker.postMessage({
        script,
        response: {
          ...responseBody,
        },
        currentVars,
        currentEnvironmentId,
      });

      timeoutId = setTimeout(() => {
        cleanupWorker(worker);
        resolve({
          name: "Script Timeout",
          passed: false,
          error: "Script execution timed out",
        });
      }, 5000);
    } catch (error) {
      cleanupWorker(worker);
      resolve({
        name: "Setup Error",
        passed: false,
        error: error.message,
      });
    }
  });
};
