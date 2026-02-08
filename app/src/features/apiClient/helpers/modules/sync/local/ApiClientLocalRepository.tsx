import { ApiClientLocalMeta, ApiClientRepositoryInterface, RepoType } from "../interfaces";
import { LocalEnvSync } from "./services/LocalApiClientEnvSync";
import { LocalApiClientRecordsSync } from "./services/LocalApiClientRecordsSync";
import { fsManagerServiceAdapterProvider } from "services/fsManagerServiceAdapter";
import { NativeError } from "errors/NativeError";

export class ApiClientLocalRepository implements ApiClientRepositoryInterface {
  meta: ApiClientLocalMeta;
  readonly repoType = RepoType.LOCAL;
  environmentVariablesRepository: LocalEnvSync;
  apiClientRecordsRepository: LocalApiClientRecordsSync;

  constructor(meta: ApiClientLocalMeta) {
    this.meta = meta;
    this.environmentVariablesRepository = new LocalEnvSync(meta);
    this.apiClientRecordsRepository = new LocalApiClientRecordsSync(meta);
  }

  async validateConnection() {
    const service = await fsManagerServiceAdapterProvider.get(this.meta.rootPath);

    if (!service) {
      throw new NativeError("Connection invalid, service cannot be undefined");
    }

    return { isValid: true };
  }
}
