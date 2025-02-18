import { LocalEnvSync as BaseLocalEnvSync } from "./services/LocalApiClientEnvSync";
import { LocalApiClientRecordsSync as BaseLocalApiClientRecordsSync } from "./services/LocalApiClientRecordsSync";

export namespace ApiClientLocalSync {
  export class LocalEnvSync extends BaseLocalEnvSync {}
  export class LocalApiClientRecordsSync extends BaseLocalApiClientRecordsSync {}
}
