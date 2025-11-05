import { useState, useCallback } from "react";
import { VariableScope } from "backend/environment/types";
import { CreateVariableFormData } from "../types";
import { useCommand } from "features/apiClient/commands";
import { useActiveEnvironment } from "features/apiClient/hooks/useActiveEnvironment.hook";
import { runtimeVariablesStore } from "features/apiClient/store/runtimeVariables/runtimeVariables.store";
import { toast } from "utils/Toast";
import { useApiClientFeatureContext } from "features/apiClient/contexts/meta";

interface UseCreateVariableResult {
  createVariable: (data: CreateVariableFormData) => Promise<void>;
  isCreating: boolean;
  error: string | null;
}

export const useCreateVariable = (collectionId?: string): UseCreateVariableResult => {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    env: { patchEnvironmentVariables },
    api: { patchCollectionVariables },
  } = useCommand();

  const activeEnvironment = useActiveEnvironment();
  const { repositories } = useApiClientFeatureContext();
  const { environmentVariablesRepository } = repositories;

  const createVariable = useCallback(
    async (data: CreateVariableFormData) => {
      setIsCreating(true);
      setError(null);

      try {
        const { variableName, scope, type, initialValue, currentValue } = data;

        // Build variable data with both initial and current values
        const variableData = {
          [variableName]: {
            id: 0, // Will be set by the store
            type,
            syncValue: initialValue || "",
            localValue: currentValue || undefined,
            isPersisted: true as const,
          },
        };

        // Create variable based on scope
        switch (scope) {
          case VariableScope.GLOBAL: {
            const globalEnvId = environmentVariablesRepository.getGlobalEnvironmentId();
            await patchEnvironmentVariables({
              environmentId: globalEnvId,
              variables: variableData,
            });
            toast.success(`Variable "${variableName}" created in Global scope`);
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
            toast.success(`Variable "${variableName}" created in ${activeEnvironment.name}`);
            break;
          }

          case VariableScope.COLLECTION:
            if (!collectionId) {
              throw new Error("Collection variable creation requires collection context");
            }
            await patchCollectionVariables({
              collectionId: collectionId,
              variables: variableData,
            });
            toast.success(`Variable "${variableName}" created in Collection`);
            break;

          case VariableScope.RUNTIME: {
            // Create in runtime store (session only)
            const runtimeValue = currentValue || initialValue || "";
            runtimeVariablesStore.getState().update(variableName, {
              type,
              localValue: runtimeValue,
            });
            toast.success(`Variable "${variableName}" created in Runtime (session only)`);
            break;
          }

          default:
            throw new Error(`Unknown scope: ${scope}`);
        }
      } catch (err: any) {
        const errorMessage = err?.message || "Failed to create variable";
        setError(errorMessage);
        toast.error(errorMessage);
        throw err;
      } finally {
        setIsCreating(false);
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
    createVariable,
    isCreating,
    error,
  };
};
