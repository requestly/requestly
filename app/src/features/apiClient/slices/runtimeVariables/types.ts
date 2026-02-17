import { EnvironmentVariables } from "../../../../backend/environment/types";

export interface RuntimeVariablesEntity {
  id: string;
  variables: EnvironmentVariables;
  variablesOrder?: string[]; // Array of variable keys in display order
}

export interface RuntimeVariablesState {
  entity: RuntimeVariablesEntity;
}
