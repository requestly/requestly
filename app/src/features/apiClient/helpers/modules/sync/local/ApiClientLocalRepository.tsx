import { ApiClientLocalMeta, ApiClientRepositoryInterface, RepoType } from "../interfaces";
import { LocalEnvSync } from "./services/LocalApiClientEnvSync";
import { LocalApiClientRecordsSync } from "./services/LocalApiClientRecordsSync";

export class ApiClientLocalRepository implements ApiClientRepositoryInterface {
  readonly repoType = RepoType.LOCAL;
  environmentVariablesRepository: LocalEnvSync;
  apiClientRecordsRepository: LocalApiClientRecordsSync;

  constructor(meta: ApiClientLocalMeta) {
    this.environmentVariablesRepository = new LocalEnvSync(meta);
    this.apiClientRecordsRepository = new LocalApiClientRecordsSync(meta);
  }
}
