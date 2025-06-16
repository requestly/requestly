import { ApiClientLocalStorageMeta, ApiClientRepositoryInterface } from "../interfaces";
import { LocalStorageEnvSync } from "./services/LocalStorageEnvSync";
import { LocalStorageRecordsSync } from "./services/LocalStorageRecordsSync";

export class ApiClientLocalStorageRepository implements ApiClientRepositoryInterface {
  environmentVariablesRepository: LocalStorageEnvSync;
  apiClientRecordsRepository: LocalStorageRecordsSync;

  constructor(meta: ApiClientLocalStorageMeta) {
    this.environmentVariablesRepository = new LocalStorageEnvSync(meta);
    this.apiClientRecordsRepository = new LocalStorageRecordsSync(meta);
  }
}
