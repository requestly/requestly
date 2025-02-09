import { ApiClientCloudMeta } from "../interfaces";
import { ApiClientCloudSync } from "./CloudSync";

export class ApiClientCloudRepository {
  environmentVariablesRepository: ApiClientCloudSync.FirebaseEnvSync;
  apiClientRecordsRepository: ApiClientCloudSync.FirebaseApiClientRecordsSync;

  constructor(meta: ApiClientCloudMeta) {
    this.environmentVariablesRepository = new ApiClientCloudSync.FirebaseEnvSync(meta);
    this.apiClientRecordsRepository = new ApiClientCloudSync.FirebaseApiClientRecordsSync(meta);
  }
}
