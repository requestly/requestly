import { useState, useCallback } from "react";
import { VariableScope } from "backend/environment/types";
import { CreateVariableFormData } from "../types";
import { useCommand } from "features/apiClient/commands";
import { useActiveEnvironment } from "features/apiClient/hooks/useActiveEnvironment.hook";
import { runtimeVariablesStore } from "features/apiClient/store/runtimeVariables/runtimeVariables.store";
import { toast } from "utils/Toast";
import { useApiClientFeatureContext } from "features/apiClient/contexts/meta";

interface UseUpdateVariableResult {
  updateVariable: (data: CreateVariableFormData) => Promise<void>;
  isUpdating: boolean;
  error: string | null;
}

export const useUpdateVariable = (collectionId?: string): UseUpdateVariableResult => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    env: { patchEnvironmentVariables },
    api: { patchCollectionVariables },
  } = useCommand();

  const activeEnvironment = useActiveEnvironment();
  const { repositories } = useApiClientFeatureContext();
  const { environmentVariablesRepository } = repositories;

  const updateVariable = useCallback(
    async (data: CreateVariableFormData) => {
      setIsUpdating(true);
      setError(null);

      try {
        const { variableName, scope, type, initialValue, currentValue } = data;

        const variableData = {
          [variableName]: {
            id: 0, // Will be preserved by the store
            type,
            syncValue: initialValue ?? "",
            localValue: currentValue ?? "",
            isPersisted: true as const,
          },
        };

        // Update variable in its current scope (scope cannot be changed in edit mode)
        switch (scope) {
          case VariableScope.GLOBAL: {
            const globalEnvId = environmentVariablesRepository.getGlobalEnvironmentId();
            await patchEnvironmentVariables({
              environmentId: globalEnvId,
              variables: variableData,
            });
            toast.success(`Variable "${variableName}" updated in Global scope`);
            break;
          }

          case VariableScope.ENVIRONMENT: {
            if (!activeEnvironment) {
              throw new Error("No active environment selected");
            }
            await patchEnvironmentVariables({
              environmentId: activeEnvironment.id,
              variables: variableData,
            });
            toast.success(`Variable "${variableName}" updated in ${activeEnvironment.name}`);
            break;
          }

          case VariableScope.COLLECTION:
            if (!collectionId) {
              throw new Error("Collection variable update requires collection context");
            }
            await patchCollectionVariables({
              collectionId: collectionId,
              variables: variableData,
            });
            toast.success(`Variable "${variableName}" updated in Collection`);
            break;

          case VariableScope.RUNTIME: {
            // Update in runtime store
            const runtimeValue = currentValue ?? initialValue ?? "";

            const existingVariables = runtimeVariablesStore.getState().data;
            const existingVariable = existingVariables.get(variableName);
            const variableId = existingVariable?.id ?? 0;

            runtimeVariablesStore.getState().add(variableName, {
              id: variableId,
              type,
              localValue: runtimeValue,
              isPersisted: true,
            });
            toast.success(`Variable "${variableName}" updated in Runtime`);
            break;
          }

          default:
            throw new Error(`Unknown scope: ${scope}`);
        }
      } catch (err: any) {
        const errorMessage = err?.message || "Failed to update variable";
        setError(errorMessage);
        toast.error(errorMessage);
        throw err;
      } finally {
        setIsUpdating(false);
      }
    },
    [
      activeEnvironment,
      collectionId,
      environmentVariablesRepository,
      patchEnvironmentVariables,
      patchCollectionVariables,
    ]
  );

  return {
    updateVariable,
    isUpdating,
    error,
  };
};
