import { useState, useCallback } from "react";
import { VariableScope } from "backend/environment/types";
import { CreateVariableFormData, UpsertVariableResult } from "../types";
import { useCommand } from "features/apiClient/commands";
import { useActiveEnvironment } from "features/apiClient/hooks/useActiveEnvironment.hook";
import { runtimeVariablesStore } from "features/apiClient/store/runtimeVariables/runtimeVariables.store";
import { useApiClientFeatureContext } from "features/apiClient/contexts/meta";

type UpsertMode = "create" | "update";

type UpsertVariableStatus =
  | { upserting: false; errored: false }
  | { upserting: true; errored: false }
  | { upserting: false; errored: true; error: string };

interface UseUpsertVariableResult {
  upsertVariable: (data: CreateVariableFormData, mode: UpsertMode) => Promise<UpsertVariableResult>;
  status: UpsertVariableStatus;
}

export const useUpsertVariable = (collectionId?: string): UseUpsertVariableResult => {
  const [status, setStatus] = useState<UpsertVariableStatus>({ upserting: false, errored: false });

  const {
    env: { patchEnvironmentVariables },
    api: { patchCollectionVariables },
  } = useCommand();

  const activeEnvironment = useActiveEnvironment();
  const { repositories } = useApiClientFeatureContext();
  const { environmentVariablesRepository } = repositories;

  const upsertVariable = useCallback(
    async (data: CreateVariableFormData, mode: UpsertMode): Promise<UpsertVariableResult> => {
      setStatus({ upserting: true, errored: false });

      try {
        const { variableName, scope, type, initialValue, currentValue } = data;

        const variableData = {
          [variableName]: {
            id: 0, // Will be set/preserved by the store
            type,
            syncValue: initialValue ?? "",
            localValue: currentValue ?? "",
            isPersisted: true as const,
          },
        };

        let scopeName: string | undefined;

        // Upsert variable based on scope
        switch (scope) {
          case VariableScope.GLOBAL: {
            const globalEnvId = environmentVariablesRepository.getGlobalEnvironmentId();
            await patchEnvironmentVariables({
              environmentId: globalEnvId,
              variables: variableData,
            });
            scopeName = "Global";
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
            scopeName = activeEnvironment.name;
            break;
          }

          case VariableScope.COLLECTION:
            if (!collectionId) {
              throw new Error(
                `Collection variable ${mode === "create" ? "creation" : "update"} requires collection context`
              );
            }
            await patchCollectionVariables({
              collectionId: collectionId,
              variables: variableData,
            });
            scopeName = "Collection";
            break;

          case VariableScope.RUNTIME: {
            // Upsert in runtime store (session only)
            const runtimeValue = currentValue ?? initialValue ?? "";

            let variableId = 0;
            if (mode === "create") {
              // Generate a new ID for create mode
              const existingVariables = runtimeVariablesStore.getState().data;
              variableId =
                existingVariables.size > 0 ? Math.max(...Array.from(existingVariables.values(), (v) => v.id)) + 1 : 0;
            } else {
              // Preserve existing ID for update mode
              const existingVariables = runtimeVariablesStore.getState().data;
              const existingVariable = existingVariables.get(variableName);
              variableId = existingVariable?.id ?? 0;
            }

            runtimeVariablesStore.getState().add(variableName, {
              id: variableId,
              type,
              localValue: runtimeValue,
              isPersisted: true,
            });
            scopeName = "Runtime";
            break;
          }

          default:
            throw new Error(`Unknown scope: ${scope}`);
        }

        setStatus({ upserting: false, errored: false });

        return {
          success: true,
          scope,
          scopeName,
        };
      } catch (err: any) {
        const errorMessage = err?.message || `Failed to ${mode === "create" ? "create" : "update"} variable`;
        setStatus({ upserting: false, errored: true, error: errorMessage });
        throw new Error(errorMessage);
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
    upsertVariable,
    status,
  };
};
