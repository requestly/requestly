import { ApiClientLocalStoreMeta, ApiClientRepositoryInterface } from "../interfaces";
import { ApiClientLocalStorage } from "./helpers/ApiClientLocalStorage";
import { LocalStoreEnvSync } from "./services/LocalStoreEnvSync";
import { LocalStoreRecordsSync } from "./services/LocalStoreRecordsSync";

export class ApiClientLocalStoreRepository implements ApiClientRepositoryInterface {
  environmentVariablesRepository: LocalStoreEnvSync;
  apiClientRecordsRepository: LocalStoreRecordsSync;

  constructor(meta: ApiClientLocalStoreMeta) {
    new ApiClientLocalStorage(meta);
    this.environmentVariablesRepository = new LocalStoreEnvSync();
    this.apiClientRecordsRepository = new LocalStoreRecordsSync();
  }
}
