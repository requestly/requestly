import { EntityState } from "@reduxjs/toolkit";
import type { RQAPI } from "features/apiClient/types";

export type RunnerConfigId = string;

export interface RunnerConfigState {
  configs: EntityState<RunConfigEntity>;
}

export interface RunConfigEntity extends SavedRunConfigRecord {
  collectionId: RQAPI.CollectionRecord["id"];
  configId: string;
}

export type SavedRunConfig = {
  id: RQAPI.RunConfig["id"];
  runOrder: RQAPI.RunOrder;
  delay: RQAPI.RunConfig["delay"];
  iterations: RQAPI.RunConfig["iterations"];
  dataFile: RQAPI.RunConfig["dataFile"];
};

export type SavedRunConfigRecord = SavedRunConfig & {
  createdTs: number;
  updatedTs: number;
};