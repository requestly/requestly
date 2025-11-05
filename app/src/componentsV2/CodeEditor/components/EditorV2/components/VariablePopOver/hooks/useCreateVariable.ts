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

export const useCreateVariable = (): UseCreateVariableResult => {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    env: { setEnvironmentVariables },
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

        // Build variable data
        const variableData = {
          [variableName]: {
            id: 0, // Will be set by the store
            type,
            syncValue: initialValue || "",
            isPersisted: true as const,
          },
        };

        // Create variable based on scope
        switch (scope) {
          case VariableScope.GLOBAL: {
            const globalEnvId = environmentVariablesRepository.getGlobalEnvironmentId();
            await setEnvironmentVariables({
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
            await setEnvironmentVariables({
              environmentId: activeEnvironment.id,
              variables: variableData,
            });
            toast.success(`Variable "${variableName}" created in ${activeEnvironment.name}`);
            break;
          }

          case VariableScope.COLLECTION: {
            // Collection variables will be handled separately
            // For now, throw error as we need collectionId context
            throw new Error("Collection variable creation requires collection context");
          }

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
    [activeEnvironment, environmentVariablesRepository, setEnvironmentVariables]
  );

  return {
    createVariable,
    isCreating,
    error,
  };
};
