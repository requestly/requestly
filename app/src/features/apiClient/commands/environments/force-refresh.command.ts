import { ApiClientFeatureContext } from "features/apiClient/store/apiClientFeatureContext/apiClientFeatureContext.store";
import { closeCorruptedTabs } from "../tabs";

export async function forceRefreshEnvironments(ctx: ApiClientFeatureContext) {
  const {
    repositories: { environmentVariablesRepository },
    stores: { environments: environmentsStore, erroredRecords: erroredRecordsStore },
  } = ctx;
  const result = await environmentVariablesRepository.getAllEnvironments();
  if (!result.success) {
    throw new Error("Could not fetch environments!");
  }
  erroredRecordsStore.getState().setEnvironmentErroredRecords(result.data.erroredRecords);

  const globalEnvId = environmentVariablesRepository.getGlobalEnvironmentId();
  const { [globalEnvId]: globalEnvironment, ...otherEnvs } = result.data.environments;

  environmentsStore.getState().refresh({
    globalEnvironment,
    environments: otherEnvs,
  });
  closeCorruptedTabs();
}
