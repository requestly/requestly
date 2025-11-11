import { ApiClientRepositoryInterface } from "features/apiClient/helpers/modules/sync/interfaces";
import { ContextSetupData } from "./setupContextWithRepo.command";
import { toast } from "utils/Toast";

export async function extractSetupDataFromRepository(
  repository: ApiClientRepositoryInterface
): Promise<ContextSetupData> {
  const { apiClientRecordsRepository, environmentVariablesRepository } = repository;
  console.log("[EXTRACT] Starting for rootPath:", environmentVariablesRepository.meta?.rootPath);
  let records: ContextSetupData["apiClientRecords"];
  let environments: ContextSetupData["environments"];
  let erroredRecords: ContextSetupData["erroredRecords"] = { apiErroredRecords: [], environmentErroredRecords: [] };

  console.log("[EXTRACT] Calling getAllRecords and getAllEnvironments...");
  const [fetchedRecordsResult, fetchedEnvResult] = await Promise.all([
    apiClientRecordsRepository.getAllRecords(),
    environmentVariablesRepository.getAllEnvironments(),
  ]);
  console.log("[EXTRACT] Promise.all completed", {
    recordsSuccess: fetchedRecordsResult.success,
    envSuccess: fetchedEnvResult.success,
  });

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
    console.log("[EXTRACT] Looking for global env", {
      globalEnvId,
      allEnvKeys: Object.keys(allEnvironments),
      rootPath: environmentVariablesRepository.meta?.rootPath,
    });
    const { [globalEnvId]: globalEnv, ...otherEnvs } = allEnvironments;

    if (!globalEnv) {
      console.error("[EXTRACT] Global env NOT FOUND!", { globalEnvId, allEnvironments });
      throw new Error("Global Environment doesn't exist");
    }

    console.log("[EXTRACT] Global env found successfully");
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
