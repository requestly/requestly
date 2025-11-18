import { useState, useCallback } from "react";
import { VariableScope } from "backend/environment/types";
import { CreateVariableFormData } from "../types";
import { useCommand } from "features/apiClient/commands";
import { useActiveEnvironment } from "features/apiClient/hooks/useActiveEnvironment.hook";
import { runtimeVariablesStore } from "features/apiClient/store/runtimeVariables/runtimeVariables.store";
import { toast } from "utils/Toast";
import { useApiClientFeatureContext } from "features/apiClient/contexts/meta";

type CreateVariableStatus =
  | { creating: false; errored: false }
  | { creating: true; errored: false }
  | { creating: false; errored: true; error: string };

interface UseCreateVariableResult {
  createVariable: (data: CreateVariableFormData) => Promise<void>;
  status: CreateVariableStatus;
}

export const useCreateVariable = (collectionId?: string): UseCreateVariableResult => {
  const [status, setStatus] = useState<CreateVariableStatus>({ creating: false, errored: false });

  const {
    env: { patchEnvironmentVariables },
    api: { patchCollectionVariables },
  } = useCommand();

  const activeEnvironment = useActiveEnvironment();
  const { repositories } = useApiClientFeatureContext();
  const { environmentVariablesRepository } = repositories;

  const createVariable = useCallback(
    async (data: CreateVariableFormData) => {
      setStatus({ creating: true, errored: false });

      try {
        const { variableName, scope, type, initialValue, currentValue } = data;

        const variableData = {
          [variableName]: {
            id: 0, // Will be set by the store
            type,
            syncValue: initialValue ?? "",
            localValue: currentValue ?? "",
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
            const runtimeValue = currentValue ?? initialValue ?? "";

            // Generate an ID for the new variable
            const existingVariables = runtimeVariablesStore.getState().data;
            const newId =
              existingVariables.size > 0 ? Math.max(...Array.from(existingVariables.values(), (v) => v.id)) + 1 : 0;

            runtimeVariablesStore.getState().add(variableName, {
              id: newId,
              type,
              localValue: runtimeValue,
              isPersisted: true,
            });
            toast.success(`Variable "${variableName}" created in Runtime (session only)`);
            break;
          }

          default:
            throw new Error(`Unknown scope: ${scope}`);
        }
        setStatus({ creating: false, errored: false });
      } catch (err: any) {
        const errorMessage = err?.message || "Failed to create variable";
        setStatus({ creating: false, errored: true, error: errorMessage });
        toast.error(errorMessage);
        throw err;
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
    status,
  };
};
