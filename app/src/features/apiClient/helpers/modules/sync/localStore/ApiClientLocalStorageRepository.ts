import { ApiClientLocalStoreMeta, ApiClientRepositoryInterface } from "../interfaces";
import { LocalStoreEnvSync } from "./services/LocalStoreEnvSync";
import { LocalStoreRecordsSync } from "./services/LocalStoreRecordsSync";

export class ApiClientLocalStoreRepository implements ApiClientRepositoryInterface {
  environmentVariablesRepository: LocalStoreEnvSync;
  apiClientRecordsRepository: LocalStoreRecordsSync;

  constructor(meta: ApiClientLocalStoreMeta) {
    this.environmentVariablesRepository = new LocalStoreEnvSync(meta);
    this.apiClientRecordsRepository = new LocalStoreRecordsSync(meta);
  }
}

const localStoreRepository = new ApiClientLocalStoreRepository({ version: 1 });
export default localStoreRepository;
