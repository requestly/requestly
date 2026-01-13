import type { EnvironmentVariableType, VariableValueType } from "backend/environment/types";
import type { EnvironmentVariableData } from "features/apiClient/store/variables/types";
import { v4 as uuidv4 } from "uuid";

/**
 * Converts form data into an EnvironmentVariableData object.
 * Generates a new UUID if existingId is not provided (create mode).
 * For runtime scope, only localValue is used (no syncValue).
 *
 * @param variableName - The variable key/name
 * @param formData - Form state containing type, initialValue, currentValue
 * @param existingId - Optional ID for edit mode (reuses existing variable ID)
 * @returns Object with key and variable data ready for Redux store
 */
export function parseRawVariable(
  variableName: string,
  formData: {
    type: EnvironmentVariableType;
    initialValue: VariableValueType;
    currentValue: VariableValueType;
  },
  existingId?: string
): {
  key: string;
  variable: {
    id: string;
    type: EnvironmentVariableType;
    syncValue?: VariableValueType;
    localValue: VariableValueType;
    isPersisted: true;
  };
} {
  const id = existingId ?? uuidv4();
  const syncValue = formData.initialValue ?? "";
  const localValue = formData.currentValue ?? "";

  return {
    key: variableName,
    variable: {
      id,
      type: formData.type,
      syncValue,
      localValue,
      isPersisted: true as const,
    },
  };
}

/**
 * Merges a variable into the existing variables record.
 * Creates a new object to maintain immutability (Redux pattern).
 *
 * @param existingVariables - Current variables from Redux store
 * @param key - Variable key/name
 * @param variable - Variable data to merge
 * @returns New variables object with merged variable
 */
export function mergeVariable(
  existingVariables: Record<string, EnvironmentVariableData>,
  key: string,
  variable: EnvironmentVariableData
): Record<string, EnvironmentVariableData> {
  return {
    ...existingVariables,
    [key]: variable,
  };
}
