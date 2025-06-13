import { ApiClientInMemoryMeta, ApiClientRepositoryInterface } from "../interfaces";
import { InMemoryEnvSync } from "./services/InMemoryApiClientEnvSync";
import { InMemoryApiClientRecordsSync } from "./services/InMemoryApiClientRecordsSync";

export class ApiClientInMemoryRepository implements ApiClientRepositoryInterface {
  environmentVariablesRepository: InMemoryEnvSync;
  apiClientRecordsRepository: InMemoryApiClientRecordsSync;

  constructor(meta: ApiClientInMemoryMeta) {
    this.environmentVariablesRepository = new InMemoryEnvSync(meta);
    this.apiClientRecordsRepository = new InMemoryApiClientRecordsSync(meta);
  }
}
