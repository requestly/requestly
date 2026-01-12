import { isEmpty, unionBy } from "lodash";
import { AUTH_ENTRY_IDENTIFIER } from "../screens/apiClient/components/views/components/request/components/AuthorizationView/AuthorizationForm/formStructure/types";
import { KeyValuePair, RQAPI } from "../types";
import { Authorization } from "../screens/apiClient/components/views/components/request/components/AuthorizationView/types/AuthConfig";
import { getDefaultAuth } from "../screens/apiClient/components/views/components/request/components/AuthorizationView/defaults";

/*
  allRecords is passed to resolve the "INHERIT" auth type, to recursively
  resolve the parent record's auth type
*/
export const getEffectiveAuthForEntry = (
  entry: RQAPI.ApiEntry,
  entryDetails: {
    id: RQAPI.ApiClientRecord["id"];
    parentId: RQAPI.ApiClientRecord["collectionId"];
  },
  allRecords: RQAPI.ApiClientRecord[]
) => {
  const entryCopy = JSON.parse(JSON.stringify(entry)) as RQAPI.ApiEntry;
  const currentAuth = entryCopy.auth;

  let finalAuth: RQAPI.Auth | null = currentAuth;
  if (isEmpty(currentAuth)) {
    finalAuth = getDefaultAuth(entryDetails.parentId === null);
  }
  if (finalAuth.currentAuthType === Authorization.Type.INHERIT) {
    finalAuth = inheritAuthFromParent(entryDetails, allRecords);
  }

  finalAuth = pruneConfig(finalAuth);
  return finalAuth;
};

export const getHeadersAndQueryParams = (auth: RQAPI.Auth) => {
  if (!auth) {
    return {
      headers: [],
      queryParams: [],
    };
  }
  return extractAuthHeadersAndParams(auth);
};

export function inheritAuthFromParent(
  childDetails: {
    id: RQAPI.ApiClientRecord["id"];
    parentId: RQAPI.ApiClientRecord["collectionId"] | undefined;
  },
  allRecords: RQAPI.ApiClientRecord[]
) {
  const parentRecord = allRecords.find((record) => record.id === childDetails.parentId);
  if (!parentRecord) {
    console.warn(`Parent Record (id: ${childDetails.parentId}) not found for child with id ${childDetails.id}`);
    console.log("DBG: implying no_auth");
    return {
      currentAuthType: Authorization.Type.NO_AUTH,
      authConfigStore: {},
    };
  }
  let parentAuth = parentRecord?.data?.auth;

  if (isEmpty(parentAuth)) {
    return {
      currentAuthType: Authorization.Type.NO_AUTH,
      authConfigStore: {},
    };
  }

  if (!isEmpty(parentAuth) && parentAuth.currentAuthType === Authorization.Type.INHERIT) {
    const newChildDetails = {
      id: parentRecord.id,
      parentId: parentRecord.collectionId,
    };
    parentAuth = inheritAuthFromParent(newChildDetails, allRecords);
  }

  return parentAuth;
}

/* This function expects inherit to have been resolved. The argument should be the effective authType */
export function extractAuthHeadersAndParams(auth: RQAPI.Auth) {
  const resultingHeaders: KeyValuePair[] = [];
  const resultingQueryParams: KeyValuePair[] = [];

  const addEntryToResults = (result: KeyValuePair[], key: string, value: string) => {
    const newOption = {
      id: Date.now(),
      key,
      value,
      type: AUTH_ENTRY_IDENTIFIER,
      isEnabled: true,
    } as KeyValuePair;
    result.push(newOption);
  };

  switch (auth.currentAuthType) {
    case Authorization.Type.INHERIT:
      break;
    case Authorization.Type.NO_AUTH:
      break;
    case Authorization.Type.BASIC_AUTH: {
      if (!auth.authConfigStore?.[Authorization.Type.BASIC_AUTH]) break; // invalid auth config gets stored as null for now
      const { username = "", password = "" } = auth.authConfigStore[Authorization.Type.BASIC_AUTH];
      const credentials = `${username}:${password}`;
      // Use TextEncoder and btoa to handle UTF-8 characters properly
      const base64Credentials = btoa(String.fromCharCode(...new TextEncoder().encode(credentials)));
      addEntryToResults(resultingHeaders, "Authorization", `Basic ${base64Credentials}`);
      break;
    }
    case Authorization.Type.BEARER_TOKEN: {
      if (!auth.authConfigStore?.[Authorization.Type.BEARER_TOKEN]) break; // invalid auth config gets stored as null for now
      const { bearer } = auth.authConfigStore[Authorization.Type.BEARER_TOKEN];
      addEntryToResults(resultingHeaders, "Authorization", `Bearer ${bearer}`);
      break;
    }
    case Authorization.Type.API_KEY: {
      if (!auth.authConfigStore?.[Authorization.Type.API_KEY]) break; // invalid auth config gets stored as null for now
      const { key, value, addTo } = auth.authConfigStore[Authorization.Type.API_KEY];
      addEntryToResults(addTo === "QUERY" ? resultingQueryParams : resultingHeaders, key, value);
      break;
    }
    default:
      throw new Error("Invalid Auth Type");
  }

  return {
    headers: resultingHeaders,
    queryParams: resultingQueryParams,
  };
}

/* Last line of checks against older records that were created before validations were added to the form */
function pruneConfig(auth?: RQAPI.Auth): RQAPI.Auth | null {
  if (!auth) {
    return null;
  }

  const { currentAuthType, authConfigStore } = auth;
  switch (currentAuthType) {
    case Authorization.Type.NO_AUTH:
    case Authorization.Type.INHERIT:
      return {
        currentAuthType,
        authConfigStore: {},
      };
    case Authorization.Type.BASIC_AUTH:
      if (isEmpty(authConfigStore[Authorization.Type.BASIC_AUTH])) {
        authConfigStore[Authorization.Type.BASIC_AUTH] = {
          username: "",
          password: "",
        };
      }
      break;
    case Authorization.Type.BEARER_TOKEN:
      console.log("DBG: authConfigStore", authConfigStore);
      if (
        isEmpty(authConfigStore[Authorization.Type.BEARER_TOKEN]) ||
        !authConfigStore[Authorization.Type.BEARER_TOKEN].bearer
      ) {
        return null;
      }
      break;
    case Authorization.Type.API_KEY:
      if (
        isEmpty(authConfigStore[Authorization.Type.API_KEY]) ||
        !authConfigStore[Authorization.Type.API_KEY].key ||
        !authConfigStore[Authorization.Type.API_KEY].value ||
        !["HEADER", "QUERY"].includes(authConfigStore[Authorization.Type.API_KEY].addTo)
      ) {
        return null;
      }
      break;
    default:
      throw new Error("Invalid Auth Type");
  }

  type validAuthType = keyof typeof authConfigStore;
  Object.keys(authConfigStore).forEach((availableAuthType: validAuthType) => {
    if (availableAuthType !== currentAuthType) {
      delete authConfigStore[availableAuthType];
    }
  });
  auth.authConfigStore = authConfigStore;
  return auth;
}

export const updateRequestWithAuthOptions = (data: KeyValuePair[], dataToAdd: KeyValuePair[]) => {
  if (isEmpty(dataToAdd)) {
    return data;
  }

  const filterDataWithKeys = dataToAdd.filter((data) => data.key);

  // Mergin using key so that headers/queryparams aren't appended multiple times
  return unionBy(data, filterDataWithKeys, (item) => item?.key?.toLowerCase());
};
