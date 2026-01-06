import { VariableScope } from "backend/environment/types";
import type { EnvironmentVariables } from "backend/environment/types";
import { useEntity, useEnvironmentEntity } from "features/apiClient/slices/entities/hooks";
import { ApiClientEntityType } from "features/apiClient/slices/entities/types";
import { GLOBAL_ENVIRONMENT_ID, RUNTIME_VARIABLES_ENTITY_ID } from "features/apiClient/slices/common/constants";
import { useActiveEnvironment, useApiClientFeatureContext } from "features/apiClient/slices";
import { useCollectionIdByRecordId } from "features/apiClient/slices/apiRecords/apiRecords.hooks";
import { useHostContext } from "hooks/useHostContext";
import { useStore } from "react-redux";
import { useWorkspaceViewStore } from "features/apiClient/common/WorkspaceProvider";
import type { Store } from "@reduxjs/toolkit";

/**
 * Adapter for scope-specific variable operations.
 * Provides Redux entity API, repository save function, and the correct store for a given scope.
 */
export interface VariableScopeAdapter {
  /** Redux entity with variables API (getAll, add, set, delete) */
  entity: {
    variables: {
      getAll: (state: unknown) => EnvironmentVariables;
      add: (params: Record<string, unknown>) => string;
      set: (params: Record<string, unknown>) => void;
      delete: (id: string) => void;
    };
  };
  /** Entity ID for repository operations */
  entityId: string;
  /** Save variables to the appropriate repository (Firebase/IndexedDB/FileSystem) */
  saveVariablesToRepository: (variables: EnvironmentVariables) => Promise<void>;
  /** Human-readable scope name for toast messages */
  scopeDisplayName: string;
  /**
   * The Redux store instance for this scope.
   * Runtime scope uses global store (RootState).
   * Other scopes use API Client workspace store (ApiClientStoreState).
   */
  store: Store;
}

/**
 * Returns scope-specific Redux entity, repository save function, and correct store.
 * Abstracts the branching logic for different variable scopes.
 *
 * Runtime variables use the global Redux store (RootState).
 * Other scopes use the API Client workspace store (ApiClientStoreState).
 *
 * @param scope - Variable scope (GLOBAL, ENVIRONMENT, COLLECTION, RUNTIME)
 * @returns Adapter with entity, repository function, display name, and store
 * @throws Error if scope context is missing (e.g., no active environment)
 */
export function useVariableScopeAdapter(scope: VariableScope): VariableScopeAdapter {
  const { getSourceId } = useHostContext();
  const recordId = getSourceId();
  const collectionId = useCollectionIdByRecordId(recordId);
  const activeEnvironment = useActiveEnvironment();
  const { repositories } = useApiClientFeatureContext();

  const globalStore = useStore();
  const workspaceStore = useWorkspaceViewStore();

  const globalEnvEntity = useEntity({
    id: GLOBAL_ENVIRONMENT_ID,
    type: ApiClientEntityType.GLOBAL_ENVIRONMENT,
  });

  const envEntity = useEnvironmentEntity(activeEnvironment?.id || "", ApiClientEntityType.ENVIRONMENT);

  const collectionEntity = useEntity({
    id: collectionId || "",
    type: ApiClientEntityType.COLLECTION_RECORD,
  });

  const runtimeEntity = useEntity({
    id: RUNTIME_VARIABLES_ENTITY_ID,
    type: ApiClientEntityType.RUNTIME_VARIABLES,
  });

  switch (scope) {
    case VariableScope.GLOBAL:
      return {
        entity: { variables: globalEnvEntity.variables },
        entityId: GLOBAL_ENVIRONMENT_ID,
        saveVariablesToRepository: async (variables: EnvironmentVariables) => {
          await repositories.environmentVariablesRepository.updateEnvironment(GLOBAL_ENVIRONMENT_ID, { variables });
        },
        scopeDisplayName: "Global",
        store: workspaceStore,
      };

    case VariableScope.ENVIRONMENT:
      if (!activeEnvironment) {
        throw new Error("No active environment selected");
      }
      return {
        entity: { variables: envEntity.variables },
        entityId: activeEnvironment.id,
        saveVariablesToRepository: async (variables: EnvironmentVariables) => {
          await repositories.environmentVariablesRepository.updateEnvironment(activeEnvironment.id, { variables });
        },
        scopeDisplayName: activeEnvironment.name,
        store: workspaceStore,
      };

    case VariableScope.COLLECTION:
      if (!collectionId) {
        throw new Error("Collection variable operation requires collection context");
      }
      return {
        entity: { variables: collectionEntity.variables },
        entityId: collectionId,
        saveVariablesToRepository: async (variables: EnvironmentVariables) => {
          await repositories.apiClientRecordsRepository.setCollectionVariables(collectionId, variables);
        },
        scopeDisplayName: "Collection",
        store: workspaceStore,
      };

    case VariableScope.RUNTIME:
      return {
        entity: { variables: runtimeEntity.variables },
        entityId: RUNTIME_VARIABLES_ENTITY_ID,
        saveVariablesToRepository: async () => {
          // No-op - runtime variables are not persisted to repository
        },
        scopeDisplayName: "Runtime",
        store: globalStore,
      };

    default:
      throw new Error(`Unknown variable scope: ${scope}`);
  }
}
