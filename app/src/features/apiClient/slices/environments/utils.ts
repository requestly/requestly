import { EnvironmentData } from "backend/environment/types";
import { EnvironmentEntity } from "./types";

export function parseEnvironmentEntityToData(env: EnvironmentEntity): EnvironmentData {
  return {
    id: env.id,
    name: env.name,
    variables: env.variables,
    variablesOrder: env.variablesOrder,
  };
}
