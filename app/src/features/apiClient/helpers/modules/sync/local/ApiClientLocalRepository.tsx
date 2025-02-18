import { ApiClientLocalMeta } from "../interfaces";
import { ApiClientLocalSync } from "./LocalSync";

export class ApiClientLocalRepository {
  // environmentVariablesRepository: ApiClientLocalSync.FirebaseEnvSync;
  apiClientRecordsRepository: ApiClientLocalSync.LocalApiClientRecordsSync;

  constructor(meta: ApiClientLocalMeta) {
    //   this.environmentVariablesRepository = new ApiClientLocalSync.FirebaseEnvSync(meta);
    this.apiClientRecordsRepository = new ApiClientLocalSync.LocalApiClientRecordsSync(meta);
  }
}
