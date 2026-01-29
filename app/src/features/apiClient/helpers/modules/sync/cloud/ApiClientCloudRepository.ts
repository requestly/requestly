import { ApiClientCloudMeta, ApiClientRepositoryInterface, RepoType } from "../interfaces";
import { FirebaseApiClientRecordsSync } from "./services/FirebaseApiClientRecordsSync";
import { FirebaseEnvSync } from "./services/FirebaseEnvSync";

export class ApiClientCloudRepository implements ApiClientRepositoryInterface {
  readonly repoType = RepoType.CLOUD;
  environmentVariablesRepository: FirebaseEnvSync;
  apiClientRecordsRepository: FirebaseApiClientRecordsSync;

  constructor(meta: ApiClientCloudMeta) {
    this.environmentVariablesRepository = new FirebaseEnvSync(meta);
    this.apiClientRecordsRepository = new FirebaseApiClientRecordsSync(meta);
  }
}
