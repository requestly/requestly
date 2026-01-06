import { VariableScope } from "backend/environment/types";
import type { EnvironmentVariables } from "backend/environment/types";
import { useEntity } from "features/apiClient/slices/entities/hooks";
import { ApiClientEntityType } from "features/apiClient/slices/entities/types";
import { GLOBAL_ENVIRONMENT_ID, RUNTIME_VARIABLES_ENTITY_ID } from "features/apiClient/slices/common/constants";
import { EntityNotFound, useApiClientFeatureContext } from "features/apiClient/slices";
import { useStore } from "react-redux";
import { useWorkspaceViewStore } from "features/apiClient/common/WorkspaceProvider";
import type { Store } from "@reduxjs/toolkit";
import { ScopeOption } from "../types";
import { ApiClientVariables } from "features/apiClient/slices/entities/api-client-variables";

/**
 * Adapter for scope-specific variable operations.
 * Provides Redux entity API, repository save function, and the correct store for a given scope.
 */
export interface VariableScopeAdapter {
  /** Redux entity with variables API (getAll, add, set, delete) */
  entity: {
    variables: ApiClientVariables<any, any>;
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
export function useVariableScopeAdapter(scope: VariableScope, scopeOptions: ScopeOption[]): VariableScopeAdapter {
  const selectedScopeOption = scopeOptions.find((option) => option.value === scope && !option.disabled && option.id);
  if (!selectedScopeOption) {
    throw new EntityNotFound(scope, "scope");
  }
  const entity = useEntity({
    id: selectedScopeOption.id!,
    type:
      scope === VariableScope.ENVIRONMENT
        ? ApiClientEntityType.ENVIRONMENT
        : scope === VariableScope.COLLECTION
        ? ApiClientEntityType.COLLECTION_RECORD
        : scope === VariableScope.RUNTIME
        ? ApiClientEntityType.RUNTIME_VARIABLES
        : ApiClientEntityType.GLOBAL_ENVIRONMENT,
  });
  const { repositories } = useApiClientFeatureContext();

  const globalStore = useStore();
  const workspaceStore = useWorkspaceViewStore();

  switch (entity.type) {
    case ApiClientEntityType.GLOBAL_ENVIRONMENT:
      return {
        entity: { variables: entity.variables },
        entityId: entity.id,
        saveVariablesToRepository: async (variables: EnvironmentVariables) => {
          await repositories.environmentVariablesRepository.updateEnvironment(GLOBAL_ENVIRONMENT_ID, { variables });
        },
        scopeDisplayName: "Global",
        store: workspaceStore,
      };

    case ApiClientEntityType.ENVIRONMENT:
      return {
        entity: { variables: entity.variables },
        entityId: entity.id,
        saveVariablesToRepository: async (variables: EnvironmentVariables) => {
          await repositories.environmentVariablesRepository.updateEnvironment(entity.id, { variables });
        },
        scopeDisplayName: entity.getName(workspaceStore.getState()),
        store: workspaceStore,
      };

    case ApiClientEntityType.COLLECTION_RECORD:
      return {
        entity: { variables: entity.variables },
        entityId: entity.id,
        saveVariablesToRepository: async (variables: EnvironmentVariables) => {
          await repositories.apiClientRecordsRepository.setCollectionVariables(entity.id, variables);
        },
        scopeDisplayName: "Collection",
        store: workspaceStore,
      };

    case ApiClientEntityType.RUNTIME_VARIABLES:
      return {
        entity: { variables: entity.variables },
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
