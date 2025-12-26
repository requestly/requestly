import { EnvironmentVariables } from "../../../../backend/environment/types";

export interface RuntimeVariablesEntity {
  id: string;
  variables: EnvironmentVariables;
}

export interface RuntimeVariablesState {
  entity: RuntimeVariablesEntity;
}

