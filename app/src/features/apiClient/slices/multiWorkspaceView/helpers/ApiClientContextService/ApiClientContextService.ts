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
import { apiClientContextRegistry } from "../ApiClientContextRegistry";
import { ApiClientFeatureContext } from "../ApiClientContextRegistry/types";
import { ApiClientViewMode } from "../../types";
import { reduxStore } from "store";
import { getViewMode } from "../../selectors";
import { forceRefreshRecords } from "features/apiClient/commands/records";
import { forceRefreshEnvironments } from "features/apiClient/commands/environments";
import { reloadFsManager } from "services/fsManagerServiceAdapter";
import { multiWorkspaceViewActions } from "../../multiWorkspaceViewSlice";

export type UserDetails = { uid: string; loggedIn: true } | { loggedIn: false };

type ContextSetupData = {
  apiClientRecords: { records: RQAPI.ApiClientRecord[]; erroredRecords: ErroredRecord[] };
  environments: { globalEnvironment: EnvironmentData; nonGlobalEnvironments: EnvironmentMap };
  erroredRecords: { apiErroredRecords: ErroredRecord[]; environmentErroredRecords: ErroredRecord[] };
};

class ApiClientContextService {
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

  private createStore(contextId: string): ApiClientFeatureContext["store"] {
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

  setupContext(workspace: Workspace, user: UserDetails): ApiClientFeatureContext["id"] {
    const repository = this.createRepository(workspace, user);
    const id = this.setupContextWithRepo(workspace.id, repository);
    return id;
  }

  setupContextWithRepo(workspaceId: string, repository: ApiClientRepositoryInterface): ApiClientFeatureContext["id"] {
    if (apiClientContextRegistry.hasContext(workspaceId)) {
      return workspaceId;
    }

    // const { apiClientRecords, environments, erroredRecords } = await this.extractSetupDataFromRepository(repository);

    const store = this.createStore(workspaceId);
    // TODO: integration -> dispatch -> apiClientRecords, environments, erroredRecords to there slice

    const context: ApiClientFeatureContext = {
      id: workspaceId,
      workspaceId,
      store,
      repositories: repository,
    };

    const viewMode = getViewMode(reduxStore.getState());
    if (viewMode === ApiClientViewMode.SINGLE) {
      apiClientContextRegistry.clearAll();
    }

    apiClientContextRegistry.addContext(context);
    return context.id;
  }

  async refreshContext(contextId: ApiClientFeatureContext["id"]): Promise<void> {
    try {
      const context = apiClientContextRegistry.getContext(contextId);

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
          id: contextId,
          workspaceState: {
            loading: false,
            errored: true,
            error: e instanceof Error ? e.message : e,
          },
        })
      );
      throw e;
    }
  }

  async refreshAllContexts(): Promise<PromiseSettledResult<void>[]> {
    const contexts = apiClientContextRegistry.getAllContexts();

    const promises = contexts.map((context) => this.refreshContext(context.id));

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

export const apiClientContextService = new ApiClientContextService();
