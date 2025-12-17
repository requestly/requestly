import { ApiClientRepositoryInterface } from "features/apiClient/helpers/modules/sync/interfaces";
import { ContextSetupData } from "./setupContextWithRepo.command";
import { toast } from "utils/Toast";

export async function extractSetupDataFromRepository(
  repository: ApiClientRepositoryInterface
): Promise<ContextSetupData> {
  const { apiClientRecordsRepository, environmentVariablesRepository } = repository;
  let records: ContextSetupData["apiClientRecords"] = { records: [], erroredRecords: [] };
  let environments: ContextSetupData["environments"] = { globalEnvironment: {} as any, nonGlobalEnvironments: {} };
  let erroredRecords: ContextSetupData["erroredRecords"] = { apiErroredRecords: [], environmentErroredRecords: [] };
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

    if (!globalEnv) throw new Error("Global Environment doesn't exist");

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
