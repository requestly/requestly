import { EntityState } from "@reduxjs/toolkit";
import { EnvironmentVariables } from "backend/environment/types";

export interface EnvironmentEntity {
  id: string;
  name: string;
  variables: EnvironmentVariables;
  variablesOrder?: string[]; // Array of variable keys in display order
}

export interface EnvironmentsState {
  environments: EntityState<EnvironmentEntity>;
  globalEnvironment: EnvironmentEntity;
  activeEnvironmentId: string | null;
}
