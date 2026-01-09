import { SavedRunConfig } from "features/apiClient/commands/collectionRunner/types";
import { RunConfigEntity } from "./types";
import type { RQAPI } from "features/apiClient/types";
import { DELAY_MAX_LIMIT, DELAY_MIN_LIMIT, ITERATIONS_MAX_LIMIT, ITERATIONS_MIN_LIMIT } from "./constants";

export const patchRunOrder = (currentRunOrder: RQAPI.RunOrder, requestIds: string[]): RQAPI.RunOrder => {
  const incomingRequestSet = new Set(requestIds);
  // Remove stale ids from existing order
  const filteredRunOrder = currentRunOrder.filter((value) => incomingRequestSet.has(value.id));
  const filteredRunOrderIds = filteredRunOrder.map((value) => value.id);

  const filteredRunOrderSet = new Set(filteredRunOrderIds);
  const patch: RQAPI.RunOrder = [];
  for (const requestId of requestIds) {
    if (!filteredRunOrderSet.has(requestId)) {
      // Assuming all incoming requests are selected
      patch.push({ id: requestId, isSelected: true });
    }
  }

  return [...filteredRunOrder, ...patch];
};

export const getRunnerConfigId = (collectionId: string, configId: string): string => {
  return `${collectionId}::${configId}`;
};

export const parseRunnerConfigKey = (key: string): { collectionId: string; configId: string } => {
  const [collectionId, configId] = key.split("::");
  if (!collectionId || !configId) {
    throw new Error(`Invalid RunnerConfigId: ${key}`);
  }
  return { collectionId, configId };
};

export const isValidDelay = (delay: number): boolean => {
  return Number.isInteger(delay) && delay >= DELAY_MIN_LIMIT && delay <= DELAY_MAX_LIMIT;
};

export const isValidIterations = (iterations: number): boolean => {
  return Number.isInteger(iterations) && iterations >= ITERATIONS_MIN_LIMIT && iterations <= ITERATIONS_MAX_LIMIT;
};

export const toSavedRunConfig = (entity: RunConfigEntity): SavedRunConfig => {
  return {
    id: entity.configId,
    runOrder: entity.runOrder,
    delay: entity.delay,
    iterations: entity.iterations,
    dataFile: entity.dataFile,
  };
};

export const fromSavedRunConfig = (
  collectionId: string,
  saved: SavedRunConfig,
  timestamps?: { createdTs?: number; updatedTs?: number }
): RunConfigEntity => {
  return {
    id: saved.id,
    collectionId,
    configId: saved.id,
    runOrder: saved.runOrder,
    delay: saved.delay,
    iterations: saved.iterations,
    dataFile: saved.dataFile,
    ...(timestamps?.createdTs && { createdTs: timestamps.createdTs }),
    ...(timestamps?.updatedTs && { updatedTs: timestamps.updatedTs }),
  };
};
