import { getDefaultAuth } from "features/apiClient/screens/apiClient/components/views/components/request/components/AuthorizationView/defaults";
import {
  Authorization,
  AuthConfigMeta,
} from "features/apiClient/screens/apiClient/components/views/components/request/components/AuthorizationView/types/AuthConfig";
import { RQAPI } from "features/apiClient/types";

export function patchAuthSchema(record: Partial<RQAPI.ApiClientRecord>): RQAPI.ApiClientRecord["data"]["auth"] {
  const newRecord = { ...record };

  // Ensure data object exists
  if (!newRecord.data) {
    newRecord.data = {} as RQAPI.ApiClientRecord["data"];
  }

  const oldAuth = newRecord.data.auth;
  if (!oldAuth) {
    newRecord.data.auth = getDefaultAuth(newRecord.collectionId === null);
  } else {
    const extractedAuth = extractAuthDetails(oldAuth);
    newRecord.data.auth = extractedAuth;
  }
  return newRecord.data.auth;
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
  if (extraKeys.authConfigStore) {
    // already the latest version, does not need schema patching
    return oldAuth as RQAPI.Auth;
  }
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
