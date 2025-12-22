import { EntityState } from "@reduxjs/toolkit";
import { EnvironmentData, EnvironmentVariables } from "backend/environment/types";

export interface EnvironmentEntity {
  id: string;
  name: string;
  variables: EnvironmentVariables;
}

export interface EnvironmentsState {
  environments: EntityState<EnvironmentEntity, string>;
  globalEnvironment: EnvironmentEntity | null;
  activeEnvironmentId: string | null;
}

