import { isEmpty, unionBy } from "lodash";
import { AUTH_ENTRY_IDENTIFIER } from "../screens/apiClient/components/clientView/components/request/components/AuthorizationView/AuthorizationForm/formStructure/types";
import { KeyValuePair, RQAPI } from "../types";
import { Authorization } from "../screens/apiClient/components/clientView/components/request/components/AuthorizationView/types/AuthConfig";
import { getDefaultAuth } from "backend/apiClient/migrations/auth";

export const processAuthForEntry = (
  entry: RQAPI.Entry,
  entryDetails: {
    id: RQAPI.Record["id"];
    parentId: RQAPI.Record["collectionId"];
  },
  allRecords: RQAPI.Record[]
) => {
  const entryCopy = JSON.parse(JSON.stringify(entry)) as RQAPI.Entry; // Deep Copy

  const currentAuth = entryCopy.auth;
  let finalAuth: RQAPI.Auth | null = currentAuth;
  if (isEmpty(currentAuth)) {
    finalAuth = getDefaultAuth(entryDetails.parentId === null);
  }

  if (finalAuth.currentAuthType === Authorization.Type.INHERIT) {
    finalAuth = inheritAuthFromParent(entryDetails, allRecords);
  }

  if (!finalAuth) {
    return {
      headers: [],
      queryParams: [],
    };
  }

  return extractAuthHeadersAndParams(finalAuth);
};

function inheritAuthFromParent(
  childDetails: {
    id: RQAPI.Record["id"];
    parentId: RQAPI.Record["collectionId"];
  },
  allRecords: RQAPI.Record[]
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
  let parentAuth = parentRecord.data.auth;

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
function extractAuthHeadersAndParams(auth: RQAPI.Auth) {
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
      throw new Error("Inherit auth type should not be processed inside processAuthOptions");
    case Authorization.Type.NO_AUTH:
      break;
    case Authorization.Type.BASIC_AUTH: {
      if (!auth.authConfigStore) break; // invalid auth config gets stored as null for now
      const { username, password } = auth.authConfigStore[Authorization.Type.BASIC_AUTH];
      addEntryToResults(resultingHeaders, "Authorization", `Basic ${btoa(`${username || ""}:${password || ""}`)}`);
      break;
    }
    case Authorization.Type.BEARER_TOKEN: {
      console.log("DBG-1: extractAuthHeadersAndParams: auth.authConfigStore: ", auth.authConfigStore);
      if (!auth.authConfigStore) break; // invalid auth config gets stored as null for now
      const { bearer } = auth.authConfigStore[Authorization.Type.BEARER_TOKEN];
      addEntryToResults(resultingHeaders, "Authorization", `Bearer ${bearer}`);
      break;
    }
    case Authorization.Type.API_KEY: {
      if (!auth.authConfigStore) break; // invalid auth config gets stored as null for now
      const { key, value, addTo } = auth.authConfigStore[Authorization.Type.API_KEY];
      addEntryToResults(addTo === "QUERY" ? resultingQueryParams : resultingHeaders, key || "", value || "");
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

export const updateRequestWithAuthOptions = (data: KeyValuePair[], dataToAdd: KeyValuePair[]) => {
  if (isEmpty(dataToAdd)) {
    return data;
  }

  const filterDataWithKeys = dataToAdd.filter((data) => data.key);

  // Mergin using key so that headers/queryparams aren't appended multiple times
  return unionBy(data, filterDataWithKeys, (item) => item?.key?.toLowerCase());
};
