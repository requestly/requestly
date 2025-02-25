import {
  Authorization,
  AuthConfigMeta,
} from "features/apiClient/screens/apiClient/components/clientView/components/request/components/AuthorizationView/types/AuthConfig";
import { RQAPI } from "features/apiClient/types";

export function runAuthMigration(record: Partial<RQAPI.Record>): RQAPI.Record["data"]["auth"] {
  const newRecord = { ...record };
  const oldAuth = newRecord.data.auth as any;
  if (!oldAuth) {
    newRecord.data.auth = getDefaultAuth(newRecord.collectionId === null);
  } else {
    const extractedAuth = extractAuthDetails(oldAuth);
    newRecord.data.auth = extractedAuth;
  }
  return newRecord.data.auth;
}

export function getDefaultAuthType(isRootRecord: boolean): Authorization.Type {
  return isRootRecord ? Authorization.Type.NO_AUTH : Authorization.Type.INHERIT;
}

export function getDefaultAuth(isRootRecord: boolean): RQAPI.Auth {
  return {
    currentAuthType: getDefaultAuthType(isRootRecord),
    authConfigStore: {},
  };
}

/* 
  note that this does not run any validations on the existing auth config 
  hence if there are empty keys in the old auth config, they will be retained
  => if the request for a record for such a auth is processed, it will get undefined fields
  => => this leads to the empty string replacements inside the extractAuthHeadersAndParams (part of processAuthForEntry)
*/
function extractAuthDetails(oldAuth: any): RQAPI.Auth {
  if (!oldAuth) {
    // Redundant check, just to prevent any possible runtime errors
    return getDefaultAuth(false);
  }
  const { currentAuthType, ...extraKeys } = oldAuth;
  const existingConfig = extraKeys as OldAuthOptions;
  if (Authorization.hasNoConfig(currentAuthType)) {
    return {
      currentAuthType,
      authConfigStore: {},
    };
  } else {
    return {
      currentAuthType,
      authConfigStore: existingConfig,
    };
  }

  type OldAuthOptions = {
    [K in AuthConfigMeta.AuthWithConfig]?: AuthConfigMeta.TypeToConfig[K];
  };
}
