import { ApiClientCloudSync } from "./CloudSync";

export class ApiClientCloudRepository {
  environmentVariablesRepository: ApiClientCloudSync.FirebaseEnvSync;

  constructor(ownerId: string) {
    this.environmentVariablesRepository = new ApiClientCloudSync.FirebaseEnvSync(ownerId);
  }
}
