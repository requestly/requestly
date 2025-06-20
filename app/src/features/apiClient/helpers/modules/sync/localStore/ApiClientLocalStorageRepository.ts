import { ApiClientLocalStoreMeta, ApiClientRepositoryInterface } from "../interfaces";
import { ApiClientLocalStorage } from "./helpers/ApiClientLocalStorage";
import { LocalStoreEnvSync } from "./services/LocalStoreEnvSync";
import { LocalStoreRecordsSync } from "./services/LocalStoreRecordsSync";

export class ApiClientLocalStoreRepository implements ApiClientRepositoryInterface {
  environmentVariablesRepository: LocalStoreEnvSync;
  apiClientRecordsRepository: LocalStoreRecordsSync;

  constructor(meta: ApiClientLocalStoreMeta) {
    ApiClientLocalStorage.init(meta);
    this.environmentVariablesRepository = new LocalStoreEnvSync(meta);
    this.apiClientRecordsRepository = new LocalStoreRecordsSync(meta);
  }
}

const localStoreRepository = new ApiClientLocalStoreRepository({ version: 1 });
export default localStoreRepository;
