import { ApiClientRepositoryInterface } from "../interfaces";
import { LocalStoreEnvSync } from "./services/LocalStoreEnvSync";
import { LocalStoreRecordsSync } from "./services/LocalStoreRecordsSync";
import { ApiClientLocalStoreMeta } from "./services/types";

export class ApiClientLocalStoreRepository implements ApiClientRepositoryInterface {
  environmentVariablesRepository: LocalStoreEnvSync;
  apiClientRecordsRepository: LocalStoreRecordsSync;

  constructor(meta: ApiClientLocalStoreMeta) {
    this.environmentVariablesRepository = new LocalStoreEnvSync(meta);
    this.apiClientRecordsRepository = new LocalStoreRecordsSync(meta);
  }
}
