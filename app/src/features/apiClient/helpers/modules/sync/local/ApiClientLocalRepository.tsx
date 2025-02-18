import { ApiClientLocalMeta, ApiClientRepositoryInterface } from "../interfaces";
import { ApiClientLocalSync } from "./LocalSync";

export class ApiClientLocalRepository implements ApiClientRepositoryInterface {
  environmentVariablesRepository: ApiClientLocalSync.LocalEnvSync;
  apiClientRecordsRepository: ApiClientLocalSync.LocalApiClientRecordsSync;

  constructor(meta: ApiClientLocalMeta) {
    this.environmentVariablesRepository = new ApiClientLocalSync.LocalEnvSync(meta);
    this.apiClientRecordsRepository = new ApiClientLocalSync.LocalApiClientRecordsSync(meta);
  }
}
