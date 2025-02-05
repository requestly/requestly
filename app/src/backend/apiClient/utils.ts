import { EnvironmentVariables } from "backend/environment/types";

export function patchMissingIdInVariables(variables: EnvironmentVariables): EnvironmentVariables {
  return Object.fromEntries(
    Object.entries(variables).map(([key, value], index) => {
      return [
        key,
        {
          ...value,
          id: index,
        },
      ];
    })
  );
}
