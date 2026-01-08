import { EntityState } from "@reduxjs/toolkit";
import type { RQAPI } from "features/apiClient/types";

export type RunnerConfigId = string;

export const DEFAULT_RUN_CONFIG_ID = "default";

export const DELAY_MIN = 0;
export const DELAY_MAX_LIMIT = 50000; // ms
export const ITERATIONS_MIN = 1;
export const ITERATIONS_MAX_LIMIT = 1000;

export interface RunnerConfigState {
  configs: EntityState<RunConfigEntity>;
}

export type RunDataFile = RQAPI.RunConfig["dataFile"];

export interface RunConfigEntity {
  collectionId: RQAPI.CollectionRecord["id"];
  configId: string;
  runOrder: RQAPI.RunOrder;
  delay: number;
  iterations: number;
  dataFile: RunDataFile | null;
  createdTs?: number;
  updatedTs?: number;
}
