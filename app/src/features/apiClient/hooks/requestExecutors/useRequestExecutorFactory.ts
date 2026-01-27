import { getAppMode } from "store/selectors";
import { useDispatch, useSelector } from "react-redux";
import { useApiClientContext } from "../../contexts";
import { useCallback, useMemo } from "react";
import { HttpRequestPreparationService } from "../../helpers/httpRequestExecutor/httpRequestPreparationService";
import { HttpRequestValidationService } from "../../helpers/httpRequestExecutor/httpRequestValidationService";
import { toast } from "utils/Toast";
import { APIClientWorkloadManager } from "features/apiClient/helpers/modules/scriptsV2/workloadManager/APIClientWorkloadManager";
import { BaseExecutionContext } from "features/apiClient/helpers/httpRequestExecutor/scriptExecutionContext";
import {
  ApiClientFeatureContext,
  selectGlobalEnvironment,
  selectRecordById,
  useApiClientFeatureContext,
  useApiClientRepository,
  useApiClientStore,
} from "features/apiClient/slices";
import { useApiClientDispatch } from "features/apiClient/slices/hooks/base.hooks";
import { EnvironmentEntity, GlobalEnvironmentEntity } from "features/apiClient/slices/entities";
import { CollectionRecordEntity } from "features/apiClient/slices/entities/collection";
import { RuntimeVariablesEntity } from "features/apiClient/slices/entities/runtime-variables";
import { EnvironmentVariables } from "backend/environment/types";
import { ApiClientEntityType } from "features/apiClient/slices/entities/types";
import { reduxStore } from "store";

type ExecutorConstructor<T> = new (
  ctx: ApiClientFeatureContext,
  requestPreparer: HttpRequestPreparationService,
  requestValidator: HttpRequestValidationService,
  workloadManager: APIClientWorkloadManager,
  handleUpdatesFromExecutionWorker: (state: any) => Promise<void>,
  appMode: "EXTENSION" | "DESKTOP"
) => T;

export const useRequestExecutorFactory = <T>(ExecutorClass: ExecutorConstructor<T>, recordId: string): T => {
  const ctx = useApiClientFeatureContext();
  const appMode = useSelector(getAppMode);
  const store = useApiClientStore();
  const { apiClientWorkloadManager } = useApiClientContext();
  const rootDispatch = useDispatch();
  const apiClientDispatch = useApiClientDispatch();
  const repositories = useApiClientRepository();

  const handleUpdatesFromExecutionWorker = useCallback(
    async (state: BaseExecutionContext) => {
      try {
        for (const key in state) {
          const entity = (() => {
            if (key === "environment") {
              const activeEnvironmentId = store.getState().environments.activeEnvironmentId;
              if (activeEnvironmentId) {
                return new EnvironmentEntity(apiClientDispatch, { id: activeEnvironmentId });
              }
              return;
            }
            if (key === "global") {
              return new GlobalEnvironmentEntity(apiClientDispatch);
            }
            if (key === "collectionVariables") {
              const record = selectRecordById(store.getState(), recordId);
              if (!record || !record.collectionId) {
                return;
              }
              return new CollectionRecordEntity(apiClientDispatch, { id: record.collectionId });
            }
            if (key === "variables") {
              return new RuntimeVariablesEntity(rootDispatch);
            }
          })();

          if (!entity) {
            continue;
          }

          const variables = (state as any)[key] as EnvironmentVariables;

          // Delete variables that exist in store but not in execution context (were unset)
          // RuntimeVariablesEntity uses RootState, others use ApiClientStoreState
          let currentVariables: EnvironmentVariables;
          if (entity.type === ApiClientEntityType.RUNTIME_VARIABLES) {
            currentVariables = entity.variables.getAll(reduxStore.getState() as any);
          } else {
            currentVariables = entity.variables.getAll(store.getState());
          }

          for (const currentKey in currentVariables) {
            if (!(currentKey in variables)) {
              const variableToDelete = currentVariables[currentKey];
              if (variableToDelete?.id) {
                entity.variables.delete(variableToDelete.id);
              }
            }
          }

          // Add or update variables from execution context
          for (const variableKey in variables) {
            const variable = variables[variableKey]!;
            entity.variables.add({
              key: variableKey,
              ...variable,
            });
          }
          if (entity.type === ApiClientEntityType.RUNTIME_VARIABLES) {
            continue;
          }
          // For non-runtime entities, use ApiClientStoreState
          const variablesToSave = entity.variables.getAll(store.getState());

          if (entity.type === ApiClientEntityType.COLLECTION_RECORD) {
            await repositories.apiClientRecordsRepository.setCollectionVariables(entity.id, variablesToSave);
            continue;
          }
          if (entity.type === ApiClientEntityType.ENVIRONMENT) {
            await repositories.environmentVariablesRepository.updateEnvironment(entity.id, {
              variables: variablesToSave,
            });
            continue;
          }
          const globalEnvironmentId = selectGlobalEnvironment(store.getState()).id;
          await repositories.environmentVariablesRepository.updateEnvironment(globalEnvironmentId, {
            variables: variablesToSave,
          });
        }
      } catch (error) {
        console.log("Failed to update variables from script execution", error);
        toast.error("Failed to update variables from script execution");
      }
    },
    [store, apiClientDispatch, recordId, repositories, rootDispatch]
  );

  return useMemo(() => {
    const requestPreparer = new HttpRequestPreparationService(ctx);
    const requestValidator = new HttpRequestValidationService();

    return new ExecutorClass(
      ctx,
      requestPreparer,
      requestValidator,
      apiClientWorkloadManager,
      handleUpdatesFromExecutionWorker,
      appMode
    );
  }, [ExecutorClass, apiClientWorkloadManager, appMode, ctx, handleUpdatesFromExecutionWorker]);
};
