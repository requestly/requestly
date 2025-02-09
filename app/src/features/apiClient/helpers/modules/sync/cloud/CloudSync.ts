import { FirebaseEnvSync as BaseFirebaseEnvSync } from "./services/FirebaseEnvSync";
import { FirebaseApiClientRecordsSync as BaseFirebaseApiClientRecordsSync } from "./services/FirebaseApiClientRecordsSync";
export namespace ApiClientCloudSync {
  export class FirebaseEnvSync extends BaseFirebaseEnvSync {}
  export class FirebaseApiClientRecordsSync extends BaseFirebaseApiClientRecordsSync {}
}
