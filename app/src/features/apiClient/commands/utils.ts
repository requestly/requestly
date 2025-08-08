import { EnvironmentVariables, EnvironmentVariableType } from "backend/environment/types";

export function sanitizePatch(patch: EnvironmentVariables) {
  return Object.fromEntries(
    Object.entries(patch).map(([key, value], index) => {
      const typeToSaveInDB =
        value.type === EnvironmentVariableType.Secret
          ? EnvironmentVariableType.Secret
          : (typeof value.syncValue as EnvironmentVariableType);
      return [
        key.trim(),
        { localValue: value.localValue, syncValue: value.syncValue, type: typeToSaveInDB, id: index },
      ];
    })
  );
}
