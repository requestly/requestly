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
import { ApiClientFeatureContext } from "../ApiClientContextRegistry/types";
import { reduxStore } from "store";
import { forceRefreshRecords } from "features/apiClient/commands/records";
import { forceRefreshEnvironments } from "features/apiClient/commands/environments";
import { reloadFsManager } from "services/fsManagerServiceAdapter";
import { workspaceViewActions } from "../../slice";
import {
  apiClientContextRegistry,
  ApiClientContextRegistry,
} from "../ApiClientContextRegistry/ApiClientContextRegistry";
import { Err, Ok, Result } from "utils/try";
import { configureStore } from "@reduxjs/toolkit";
import { apiRecordsSlice } from "features/apiClient/slices/apiRecords";
import { WorkspaceState } from "../../types";

export type UserDetails = { uid: string; loggedIn: true } | { loggedIn: false };

type ContextSetupData = {
  apiClientRecords: { records: RQAPI.ApiClientRecord[]; erroredRecords: ErroredRecord[] };
  environments: { globalEnvironment: EnvironmentData; nonGlobalEnvironments: EnvironmentMap };
  erroredRecords: { apiErroredRecords: ErroredRecord[]; environmentErroredRecords: ErroredRecord[] };
};

class ApiClientContextService {
  contextRegistry: ApiClientContextRegistry;

  constructor(config: { contextRegistry: ApiClientContextRegistry }) {
    this.contextRegistry = config.contextRegistry;
  }

  private createRepository(params: {
    workspaceId: WorkspaceState["id"];
    workspaceMeta: WorkspaceState["meta"];
    user: UserDetails;
  }): ApiClientRepositoryInterface {
    const { workspaceId, workspaceMeta, user } = params;

    if (workspaceMeta.type === WorkspaceType.LOCAL) {
      return new ApiClientLocalRepository({ rootPath: workspaceMeta.rootPath });
    }

    if (!user.loggedIn) {
      return localStoreRepository as ApiClientRepositoryInterface;
    }

    const userId = user.uid;
    return new ApiClientCloudRepository({ uid: userId, teamId: workspaceId }) as ApiClientRepositoryInterface;
  }

  private createStore(workspaceId: ApiClientFeatureContext["workspaceId"]): ApiClientFeatureContext["store"] {
    const store = configureStore({
      reducer: {
        [apiRecordsSlice.name]: apiRecordsSlice.reducer,
      },
    });

    return store;
  }

  async createContext(workspace: WorkspaceState, userDetails: UserDetails): Promise<Result<ApiClientFeatureContext>> {
    const workspaceId = workspace.id;

    try {
      const existing = this.contextRegistry.getContext(workspaceId);
      if (existing) {
        return new Ok(existing);
      }

      const repo = this.createRepository({ workspaceId, workspaceMeta: workspace.meta, user: userDetails });
      await repo.validateConnection();

      const store = this.createStore(workspaceId);

      const result = await this.extractSetupDataFromRepository(repo);

      store.dispatch(apiRecordsSlice.actions.hydrate(result.apiClientRecords));
      //   store.dispatch(environmentsSlice.actions.setInitialData(result.environments));

      const ctx: ApiClientFeatureContext = { workspaceId, store, repositories: repo };
      this.contextRegistry.addContext(ctx);
      return new Ok(ctx);
    } catch (error) {
      return new Err(error);
    }
  }

  async refreshContext(workspaceId: ApiClientFeatureContext["workspaceId"]): Promise<void> {
    try {
      const context = this.contextRegistry.getContext(workspaceId);

      if (!context) {
        throw new NativeError("Add the context to the store before trying to refresh it");
      }

      if (context.repositories instanceof ApiClientLocalRepository) {
        await reloadFsManager(context.repositories.apiClientRecordsRepository.meta.rootPath);
      }

      // TODO: Update to use new Redux store refresh logic
      // For now, using the old commands - these will need to be migrated
      await Promise.all([forceRefreshRecords(context as any), forceRefreshEnvironments(context as any)]);
    } catch (e) {
      reduxStore.dispatch(
        workspaceViewActions.setWorkspaceStatus({
          id: workspaceId!,
          status: {
            loading: false,
            state: {
              success: false,
              error: e instanceof Error ? e : new Error(String(e)),
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
      globalEnvironment: { id: "", name: "", variables: {} },
      nonGlobalEnvironments: {},
    };
    let erroredRecords: ContextSetupData["erroredRecords"] = {
      apiErroredRecords: [],
      environmentErroredRecords: [],
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
        records: fetchedRecordsResult.data.records,
        erroredRecords: fetchedRecordsResult.data.erroredRecords,
      };
      erroredRecords.apiErroredRecords = fetchedRecordsResult.data.erroredRecords;
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
        globalEnvironment: globalEnv,
        nonGlobalEnvironments: otherEnvs,
      };
      erroredRecords.environmentErroredRecords = fetchedEnvResult.data.erroredRecords;
    }

    return {
      apiClientRecords: records,
      erroredRecords,
      environments,
    };
  }
}

export const apiClientContextService = new ApiClientContextService({
  contextRegistry: apiClientContextRegistry,
});
