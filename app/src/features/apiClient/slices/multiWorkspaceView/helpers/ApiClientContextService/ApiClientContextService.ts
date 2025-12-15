import { EnvironmentData, EnvironmentMap } from "backend/environment/types";
import { NativeError } from "errors/NativeError";
import { ApiClientRepositoryInterface } from "features/apiClient/helpers/modules/sync/interfaces";
import { ErroredRecord } from "features/apiClient/helpers/modules/sync/local/services/types";
import { ApiClientLocalRepository } from "features/apiClient/helpers/modules/sync/local";
import { ApiClientCloudRepository } from "features/apiClient/helpers/modules/sync/cloud";
import localStoreRepository from "features/apiClient/helpers/modules/sync/localStore/ApiClientLocalStorageRepository";
import { RQAPI } from "features/apiClient/types";
import { Workspace, WorkspaceType } from "features/workspaces/types";
import { toast } from "utils/Toast";
import { ApiClientFeatureContext, WorkspaceId } from "../ApiClientContextRegistry/types";
import { reduxStore } from "store";
import { forceRefreshRecords } from "features/apiClient/commands/records";
import { forceRefreshEnvironments } from "features/apiClient/commands/environments";
import { reloadFsManager } from "services/fsManagerServiceAdapter";
import { multiWorkspaceViewActions } from "../../multiWorkspaceViewSlice";
import {
  apiClientContextRegistry,
  ApiClientContextRegistry,
} from "../ApiClientContextRegistry/ApiClientContextRegistry";
import { Err, Ok, Result } from "utils/try";

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

  private createRepository(workspace: Workspace, user: UserDetails): ApiClientRepositoryInterface {
    const workspaceId = workspace.id;
    const workspaceType = workspace.workspaceType;

    if (workspaceType === WorkspaceType.LOCAL) {
      return new ApiClientLocalRepository({ rootPath: workspace.rootPath! });
    }

    if (!user.loggedIn) {
      return localStoreRepository as ApiClientRepositoryInterface;
    }

    const userId = user.uid;
    return new ApiClientCloudRepository({ uid: userId, teamId: workspaceId }) as ApiClientRepositoryInterface;
  }

  private createStore(workspaceId: WorkspaceId): ApiClientFeatureContext["store"] {
    // TODO: integration pending
    // const store = configureStore({
    //   reducer: {
    //     recordsSlice: recordsSlice.reducer,
    //     environmentSlice: environmentSlice.reducer,
    //   },
    // });

    // return store;

    // STUB
    return {} as ApiClientFeatureContext["store"];
  }

  async createContext(workspace: Workspace, userDetails: UserDetails): Promise<Result<ApiClientFeatureContext>> {
    const workspaceId = workspace.id;

    try {
      const existing = this.contextRegistry.getContext(workspaceId);
      if (existing) {
        return new Ok(existing);
      }

      const repo = this.createRepository(workspace, userDetails);
      await repo.validateConnection();

      const store = this.createStore(workspaceId);

      const result = await this.extractSetupDataFromRepository(repo);

      // TODO: at integration
      // store.dispatch(recordsSlice.actions.setInitialData(result.apiClientRecords.records));
      // store.dispatch(environmentsSlice.actions.setInitialData(result.environments));

      const ctx: ApiClientFeatureContext = { workspaceId, store, repositories: repo };
      this.contextRegistry.addContext(ctx);
      return new Ok(ctx);
    } catch (error) {
      return new Err(error);
    }
  }

  async refreshContext(workspaceId: WorkspaceId): Promise<void> {
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
        multiWorkspaceViewActions.setWorkspaceState({
          id: workspaceId!,
          workspaceState: {
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
