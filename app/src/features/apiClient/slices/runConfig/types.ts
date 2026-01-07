import type { EntityState } from "@reduxjs/toolkit";
import type { RQAPI } from "features/apiClient/types";
import type { SavedRunConfig } from "features/apiClient/commands/collectionRunner/types";

export type RunnerConfigId = string;

export const DEFAULT_RUN_CONFIG_ID = "default";

export const getRunnerConfigId = (collectionId: string, configId: string): RunnerConfigId =>
  `${collectionId}::${configId}`;

export const parseRunnerConfigKey = (key: RunnerConfigId): { collectionId: string; configId: string } => {
  const [collectionId, configId] = key.split("::");
  if (!collectionId || !configId) {
    throw new Error(`Invalid RunnerConfigId: ${key}`);
  }
  return { collectionId, configId };
};

export const DELAY_MIN = 0;
export const DELAY_MAX_LIMIT = 50000; // ms
export const ITERATIONS_MIN = 1;
export const ITERATIONS_MAX_LIMIT = 1000;

export interface RunOrderItem {
  id: RQAPI.ApiRecord["id"];
  isSelected: boolean;
}

export type RunOrder = RunOrderItem[];

export type RunDataFile = RQAPI.RunConfig["dataFile"];

export interface RunConfigEntity {
  collectionId: RQAPI.CollectionRecord["id"];
  configId: string;
  runOrder: RunOrder;
  delay: number;
  iterations: number;
  dataFile: RunDataFile | null;
  createdTs?: number;
  updatedTs?: number;
}

export interface RunnerConfigState {
  configs: EntityState<RunConfigEntity>;
}

export const isValidDelay = (delay: number): boolean => {
  return Number.isInteger(delay) && delay >= DELAY_MIN && delay <= DELAY_MAX_LIMIT;
};

export const isValidIterations = (iterations: number): boolean => {
  return Number.isInteger(iterations) && iterations >= ITERATIONS_MIN && iterations <= ITERATIONS_MAX_LIMIT;
};

export const toSavedRunConfig = (entity: RunConfigEntity): SavedRunConfig => {
  return {
    id: entity.configId, // Use just configId, not composite key
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
