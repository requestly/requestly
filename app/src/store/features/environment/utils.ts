import { EnvironmentVariables } from "backend/environment/types";

export const mergeLocalAndSyncVariables = (
  currentVariables: EnvironmentVariables,
  newVariables: EnvironmentVariables
) => {
  const updatedVariables: EnvironmentVariables = Object.fromEntries(
    Object.entries(newVariables).map(([key, value]) => {
      const prevValue = currentVariables[key];
      const updatedValue = {
        localValue: value.localValue ?? prevValue?.localValue,
        syncValue: value.syncValue ?? prevValue?.syncValue,
        type: value.type,
      };

      // Remove localValue if it doesn't exist
      if (!updatedValue.localValue) {
        delete updatedValue.localValue;
      }

      return [key, updatedValue];
    })
  );

  return {
    ...currentVariables,
    ...updatedVariables,
  };
};
