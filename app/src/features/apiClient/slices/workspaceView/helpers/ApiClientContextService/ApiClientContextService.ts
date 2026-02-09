import { EnvironmentData, EnvironmentMap } from "backend/environment/types";
import { NativeError } from "errors/NativeError";
import { ApiClientRepositoryInterface } from "features/apiClient/helpers/modules/sync/interfaces";
import { ErroredRecord } from "features/apiClient/helpers/modules/sync/local/services/types";
import { ApiClientLocalRepository } from "features/apiClient/helpers/modules/sync/local";
import { ApiClientCloudRepository } from "features/apiClient/helpers/modules/sync/cloud";
import localStoreRepository from "features/apiClient/helpers/modules/sync/localStore/ApiClientLocalStorageRepository";
import { RQAPI } from "features/apiClient/types";
import { WorkspaceType } from "features/workspaces/types";
import { toast } from "utils/Toast";
import { ApiClientFeatureContext, ApiClientStore } from "../ApiClientContextRegistry/types";
import { reduxStore } from "store";
import { reloadFsManager } from "services/fsManagerServiceAdapter";
import { workspaceViewActions } from "../../slice";
import {
  apiClientContextRegistry,
  ApiClientContextRegistry,
} from "../ApiClientContextRegistry/ApiClientContextRegistry";
import { configureStore, EntityState } from "@reduxjs/toolkit";
import { apiRecordsSlice } from "features/apiClient/slices/apiRecords";
import { forceRefreshRecords } from "features/apiClient/slices/apiRecords/thunks";
import { forceRefreshEnvironments } from "features/apiClient/slices/environments/thunks";
import { WorkspaceInfo } from "../../types";
import persistStore from "redux-persist/es/persistStore";
import { REHYDRATE } from "redux-persist";
import getStoredState from "redux-persist/es/getStoredState";
import { ApiClientVariables } from "features/apiClient/slices/entities/api-client-variables";
import {
  createApiClientRecordsPersistConfig,
  createApiClientRecordsPersistedReducer,
} from "features/apiClient/slices/apiRecords/slice";
import {
  createEnvironmentsPersistedReducer,
  createEnvironmentsPersistConfig,
  environmentsSlice,
} from "features/apiClient/slices/environments";
import { EnvironmentEntity, EnvironmentsState } from "features/apiClient/slices/environments/types";
import { bufferActions, bufferSlice, bufferSyncMiddleware } from "features/apiClient/slices/buffer";
import { erroredRecordsSlice, ErroredRecordsState } from "features/apiClient/slices/erroredRecords";
import { getEntityDataFromTabSource, GetEntityDataFromTabSourceState } from "componentsV2/Tabs/slice";
import { closeTab } from "componentsV2/Tabs/slice/thunks";
import { groupBy, mapValues } from "lodash";
import { RootState } from "store/types";
import { EntityNotFound } from "features/apiClient/slices/types";
import { runnerConfigSlice } from "features/apiClient/slices/runConfig/slice";
import { liveRunResultsSlice } from "features/apiClient/slices/liveRunResults/slice";
import { runHistorySlice } from "features/apiClient/slices/runHistory";

export type UserDetails = { uid: string; loggedIn: true } | { loggedIn: false };

type ContextSetupData = {
  apiClientRecords: { records: RQAPI.ApiClientRecord[]; erroredRecords: ErroredRecord[] };
  environments: {
    globalEnvironment: EnvironmentData;
    nonGlobalEnvironments: EnvironmentMap;
    erroredRecords: ErroredRecord[];
  };
};

function arrayToEntityState<T extends { id: string }>(items: T[]): EntityState<T> {
  return {
    ids: items.map((item) => item.id),
    entities: mapValues(
      groupBy(items, (item) => item.id),
      (group) => group[0]
    ),
  };
}

function ensureVariablesOrder(env: EnvironmentData): EnvironmentData {
  if (!env.variablesOrder && env.variables) {
    return {
      ...env,
      variablesOrder: Object.keys(env.variables),
    };
  }
  return env;
}

function ensureCollectionVariablesOrder(record: RQAPI.ApiClientRecord): RQAPI.ApiClientRecord {
  if (record.type === RQAPI.RecordType.COLLECTION) {
    if (!record.data.variablesOrder && record.data.variables) {
      return {
        ...record,
        data: {
          ...record.data,
          variablesOrder: Object.keys(record.data.variables),
        },
      };
    }
  }
  return record;
}

class ApiClientContextService {
  contextRegistry: ApiClientContextRegistry;

  constructor(config: { contextRegistry: ApiClientContextRegistry }) {
    this.contextRegistry = config.contextRegistry;
  }

  private createRepository(params: {
    workspaceId: WorkspaceInfo["id"];
    workspaceMeta: WorkspaceInfo["meta"];
    user: UserDetails;
  }): ApiClientRepositoryInterface {
    const { workspaceId, workspaceMeta, user } = params;

    if (workspaceMeta.type === WorkspaceType.LOCAL) {
      if ("rootPath" in workspaceMeta && workspaceMeta.rootPath) {
        return new ApiClientLocalRepository({ rootPath: workspaceMeta.rootPath });
      }
      throw new Error("Local workspace must have rootPath");
    }

    if (!user.loggedIn) {
      return localStoreRepository as ApiClientRepositoryInterface;
    }

    const userId = user.uid;
    return new ApiClientCloudRepository({
      uid: userId,
      //@ts-ignore
      // Ignoring workpspaceId being null for now
      teamId: workspaceId,
    }) as ApiClientRepositoryInterface;
  }

  private createStore(workspaceId: ApiClientFeatureContext["workspaceId"]): ApiClientFeatureContext["store"] {
    const manualRehydrationMiddleware = (api: any) => (next: any) => (action: any) => {
      if (action.type === REHYDRATE && !action.meta?.manual) {
        return;
      }
      return next(action);
    };
    const store = configureStore({
      devTools: {
        name: `workspace-${workspaceId}`,
      },
      reducer: {
        [apiRecordsSlice.name]: createApiClientRecordsPersistedReducer(workspaceId || "null"),
        [environmentsSlice.name]: createEnvironmentsPersistedReducer(workspaceId || "null"),
        [erroredRecordsSlice.name]: erroredRecordsSlice.reducer,
        [bufferSlice.name]: bufferSlice.reducer,
        [runnerConfigSlice.name]: runnerConfigSlice.reducer,
        [liveRunResultsSlice.name]: liveRunResultsSlice.reducer,
        [runHistorySlice.name]: runHistorySlice.reducer,
      },
      middleware(getDefaultMiddleware) {
        return getDefaultMiddleware({
          serializableCheck: false,
        })
          .concat(bufferSyncMiddleware)
          .concat(manualRehydrationMiddleware);
      },
    });

    persistStore(store);

    return store;
  }

  private async hydrateInPlace(params: {
    workspaceId: string;
    entitiesToHydrate: {
      apiClientRecords: RQAPI.ApiClientRecord[];
      environments: EnvironmentEntity[];
      globalEnvironment: EnvironmentEntity;
    };
    store: ApiClientStore;
  }) {
    const {
      workspaceId,
      entitiesToHydrate: { apiClientRecords, environments, globalEnvironment },
      store,
    } = params;
    await Promise.all([
      this.hydrateApiClientRecords({
        workspaceId,
        apiClientRecords,
        store,
      }),
      this.hydrateEnvironments({
        workspaceId,
        environments,
        globalEnvironment,
        store,
      }),
    ]);
  }

  private async hydrateApiClientRecords(params: {
    workspaceId: string;
    apiClientRecords: RQAPI.ApiClientRecord[];
    store: ApiClientStore;
  }) {
    const { workspaceId, apiClientRecords, store } = params;
    const recordsPersistConfig = createApiClientRecordsPersistConfig(workspaceId);
    await ApiClientVariables.hydrateInPlace({
      records: apiClientRecords.filter((r) => r.type === RQAPI.RecordType.COLLECTION),
      persistConfig: recordsPersistConfig,
      getVariablesFromRecord(record) {
        return record.data.variables;
      },
      getVariablesFromPersistedData(record, persistedData) {
        const persistedRecord = persistedData.records.entities[record.id];
        if (!persistedRecord) {
          return;
        }

        if (!("variables" in persistedRecord.data)) {
          return;
        }

        return persistedRecord.data.variables;
      },
    });

    store.dispatch({
      type: REHYDRATE,
      key: recordsPersistConfig.key,
      payload: {
        records: {
          ids: [],
          entities: {},
        },
        _persist: { version: 1, rehydrated: true },
      },
      err: null,
      meta: { manual: true },
    });
  }

  private async hydrateEnvironments(params: {
    workspaceId: string;
    environments: EnvironmentEntity[];
    globalEnvironment: EnvironmentEntity;
    store: ApiClientStore;
  }) {
    const { workspaceId, environments, globalEnvironment, store } = params;

    const environmentsPersistConfig = createEnvironmentsPersistConfig(workspaceId);

    const isRecord = (value: unknown): value is Record<string, unknown> =>
      typeof value === "object" && value !== null && !Array.isArray(value);

    const persistedActiveEnvironmentId = await (async (): Promise<string | null | undefined> => {
      try {
        const storedState = await getStoredState(environmentsPersistConfig);
        if (!isRecord(storedState)) {
          return undefined;
        }

        const value = storedState["activeEnvironmentId"];
        if (value === null) {
          return null;
        }
        if (typeof value !== "string") {
          return undefined;
        }

        // If the environment no longer exists, fall back to "No environment"
        return environments.some((env) => env.id === value) ? value : null;
      } catch {
        // Storage access can fail in some environments; ignore and use default state.
        return undefined;
      }
    })();

    // Hydrate environment variables in place
    await ApiClientVariables.hydrateInPlace({
      records: environments,
      persistConfig: environmentsPersistConfig,
      getVariablesFromRecord(record) {
        return record.variables;
      },
      getVariablesFromPersistedData(record, persistedData: any) {
        const persistedEnv = persistedData.environments?.entities?.[record.id];
        if (!persistedEnv) {
          return;
        }
        return persistedEnv.variables;
      },
    });

    // Hydrate global environment variables in place
    await ApiClientVariables.hydrateInPlace({
      records: [globalEnvironment],
      persistConfig: environmentsPersistConfig,
      getVariablesFromRecord(record) {
        return record.variables;
      },
      getVariablesFromPersistedData(record, persistedData: any) {
        const persistedGlobalEnv = persistedData.globalEnvironment;
        if (!persistedGlobalEnv) {
          return;
        }
        return persistedGlobalEnv.variables;
      },
    });

    // Important:
    // - Don't pass `globalEnvironment: null` (violates slice type and can briefly wipe state)
    // - Don't pass empty `environments` unless we intend to overwrite; we only need to mark rehydrated and
    //   optionally restore `activeEnvironmentId`.
    const rehydratePayload: Partial<EnvironmentsState> & { _persist: { version: number; rehydrated: true } } = {
      ...(persistedActiveEnvironmentId !== undefined ? { activeEnvironmentId: persistedActiveEnvironmentId } : {}),
      _persist: { version: 1, rehydrated: true },
    };

    store.dispatch({
      type: REHYDRATE,
      key: environmentsPersistConfig.key,
      payload: rehydratePayload,
      err: null,
      meta: { manual: true },
    });
  }

  private hydrateErroredRecords(params: { erroredRecords: ErroredRecordsState; store: ApiClientStore }): void {
    const { erroredRecords, store } = params;

    store.dispatch(
      erroredRecordsSlice.actions.hydrate({
        apiErroredRecords: erroredRecords.apiErroredRecords,
        environmentErroredRecords: erroredRecords.environmentErroredRecords,
      })
    );
  }

  private hydrateBuffers(params: {
    workspaceId: WorkspaceInfo["id"];
    store: ApiClientStore;
    records: RQAPI.ApiClientRecord[];
    environments: EnvironmentEntity[];
    globalEnvironment: EnvironmentEntity;
  }): void {
    const { workspaceId, store, records, environments, globalEnvironment } = params;

    const tabs = Object.values((reduxStore.getState() as RootState).tabs.tabs.entities);

    tabs.forEach((tab) => {
      if (!tab || tab.modeConfig.mode !== "buffer") {
        return;
      }

      if (tab.source.metadata.context.id !== workspaceId) {
        return;
      }

      try {
        const state: GetEntityDataFromTabSourceState = {
          records: {
            records: arrayToEntityState(records),
          },
          environments: {
            globalEnvironment,
            environments: arrayToEntityState(environments),
          },
        };

        const entityData = getEntityDataFromTabSource(tab.source, state);
        const { entityType, entityId, data } = entityData;

        store.dispatch(
          bufferActions.open(
            {
              isNew: false,
              entityType: entityType,
              referenceId: entityId,
              data: data,
            },
            { id: tab.modeConfig.entityId }
          )
        );
      } catch (error) {
        if (error instanceof EntityNotFound) {
          reduxStore.dispatch(closeTab({ tabId: tab.id, skipUnsavedPrompt: true }));
          return;
        }
        throw error;
      }
    });
  }

  async createContext(workspace: WorkspaceInfo, userDetails: UserDetails): Promise<void> {
    const workspaceId = workspace.id;
    const currentCtxVersion = this.contextRegistry.getVersion();

    const existing = this.contextRegistry.getContext(workspaceId);
    if (existing) {
      return;
    }

    const repo = this.createRepository({ workspaceId, workspaceMeta: workspace.meta, user: userDetails });
    await repo.validateConnection();

    const store = this.createStore(workspaceId);

    const result = await this.extractSetupDataFromRepository(repo);

    // Migrate and convert environment data to EnvironmentEntity format
    const environments: EnvironmentEntity[] = Object.values(result.environments.nonGlobalEnvironments)
      .map(ensureVariablesOrder)
      .map((env) => ({
        id: env.id,
        name: env.name,
        variables: env.variables,
        variablesOrder: env.variablesOrder,
      }));
    const globalEnvironment: EnvironmentEntity = {
      ...ensureVariablesOrder(result.environments.globalEnvironment),
    };

    await this.hydrateInPlace({
      workspaceId: workspace.id || "null",
      entitiesToHydrate: {
        apiClientRecords: result.apiClientRecords.records,
        environments,
        globalEnvironment,
      },
      store,
    });

    // Hydrate records slice
    store.dispatch(apiRecordsSlice.actions.hydrate(result.apiClientRecords));

    // Hydrate environments slice
    store.dispatch(
      environmentsSlice.actions.hydrate({
        environments,
        globalEnvironment,
      })
    );

    // Hydrate errored records slice
    this.hydrateErroredRecords({
      store,
      erroredRecords: {
        apiErroredRecords: result.apiClientRecords.erroredRecords,
        environmentErroredRecords: result.environments.erroredRecords,
      },
    });

    // Hydrate buffer tabs and close tabs with missing entities
    this.hydrateBuffers({
      workspaceId,
      store,
      records: result.apiClientRecords.records,
      environments,
      globalEnvironment,
    });

    const ctx: ApiClientFeatureContext = { workspaceId, store, repositories: repo };
    this.contextRegistry.addContext(ctx, currentCtxVersion);
  }

  async refreshContext(workspaceId: ApiClientFeatureContext["workspaceId"]): Promise<void> {
    try {
      const context = this.contextRegistry.getContext(workspaceId);

      if (!context) {
        throw new NativeError(`Add the context to the store before trying to refresh it. Workspace ID: ${workspaceId}`);
      }

      if (context.repositories instanceof ApiClientLocalRepository) {
        await reloadFsManager(context.repositories.apiClientRecordsRepository.meta.rootPath);
      }

      // TODO: Update to use new Redux store refresh logic
      // For now, using the old commands - these will need to be migrated
      await Promise.all([
        context.store.dispatch(
          forceRefreshRecords({ repository: context.repositories.apiClientRecordsRepository }) as any
        ),
        context.store.dispatch(
          forceRefreshEnvironments({ repository: context.repositories.environmentVariablesRepository }) as any
        ),
      ]);
    } catch (e) {
      reduxStore.dispatch(
        workspaceViewActions.setWorkspaceStatus({
          id: workspaceId!,
          status: {
            loading: false,
            state: {
              success: false,
              error: e instanceof Error ? e.message : String(e),
            },
          },
        })
      );
      throw e;
    }
  }

  async refreshAllContexts(): Promise<PromiseSettledResult<void>[]> {
    const contexts = this.contextRegistry.getAllContexts();
    const promises = contexts.map((context) => this.refreshContext(context.workspaceId));
    return Promise.allSettled(promises);
  }

  private async extractSetupDataFromRepository(repository: ApiClientRepositoryInterface): Promise<ContextSetupData> {
    const { apiClientRecordsRepository, environmentVariablesRepository } = repository;

    let records: ContextSetupData["apiClientRecords"] = { records: [], erroredRecords: [] };
    let environments: ContextSetupData["environments"] = {
      globalEnvironment: { id: environmentVariablesRepository.getGlobalEnvironmentId(), name: "Global", variables: {} },
      nonGlobalEnvironments: {},
      erroredRecords: [],
    };

    const [fetchedRecordsResult, fetchedEnvResult] = await Promise.all([
      apiClientRecordsRepository.getAllRecords(),
      environmentVariablesRepository.getAllEnvironments(),
    ]);

    if (!fetchedRecordsResult.success) {
      toast.error({
        message: "Could not fetch records!",
        description: fetchedRecordsResult.message || "Please try reloading the app",
        placement: "bottomRight",
      });
    } else {
      records = {
        records: fetchedRecordsResult.data.records.map(ensureCollectionVariablesOrder),
        erroredRecords: fetchedRecordsResult.data.erroredRecords,
      };
    }

    if (!fetchedEnvResult.success) {
      toast.error({
        message: "Could not fetch environments!",
        description: "Please try reloading the app",
        placement: "bottomRight",
      });
    } else {
      const allEnvironments = fetchedEnvResult.data.environments;
      const globalEnvId = environmentVariablesRepository.getGlobalEnvironmentId();
      const { [globalEnvId]: globalEnv, ...otherEnvs } = allEnvironments;

      if (!globalEnv) {
        throw new Error("Global Environment doesn't exist");
      }

      environments = {
        globalEnvironment: ensureVariablesOrder(globalEnv),
        nonGlobalEnvironments: Object.fromEntries(
          Object.entries(otherEnvs).map(([id, env]) => [id, ensureVariablesOrder(env)])
        ),
        erroredRecords: fetchedEnvResult.data.erroredRecords,
      };
    }

    return {
      apiClientRecords: records,
      environments,
    };
  }
}

export const apiClientContextService = new ApiClientContextService({
  contextRegistry: apiClientContextRegistry,
});
