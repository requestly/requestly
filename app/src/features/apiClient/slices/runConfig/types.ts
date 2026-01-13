import { EntityState } from "@reduxjs/toolkit";
import { SavedRunConfigRecord } from "features/apiClient/commands/collectionRunner/types";
import type { RQAPI } from "features/apiClient/types";

export type RunnerConfigId = string;

export interface RunnerConfigState {
  configs: EntityState<RunConfigEntity>;
}

export interface RunConfigEntity extends SavedRunConfigRecord {
  collectionId: RQAPI.CollectionRecord["id"];
  configId: string;
}
