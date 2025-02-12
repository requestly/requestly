import { isEmpty, unionBy } from "lodash";
import { AUTH_ENTRY_IDENTIFIER } from "../screens/apiClient/components/clientView/components/request/components/AuthorizationView/AuthorizationForm/formStructure/types";
import { KeyValuePair, RQAPI } from "../types";
import {
  API_KEY_FORM_VALUES,
  BASIC_AUTH_FORM_VALUES,
  BEARER_TOKEN_FORM_VALUES,
} from "../screens/apiClient/components/clientView/components/request/components/AuthorizationView/types/form";
import { Authorization } from "../screens/apiClient/components/clientView/components/request/components/AuthorizationView/types/AuthConfig";

export const processAuthForEntry = (
  entry: RQAPI.Entry,
  entryDetails: {
    id: RQAPI.Record["id"];
    collectionId: RQAPI.Record["collectionId"];
  },
  allRecords: RQAPI.Record[]
) => {
  const entryCopy = JSON.parse(JSON.stringify(entry)); // Deep Copy

  let authOptions = entryCopy.auth;

  if (isEmpty(authOptions)) {
    let currentAuthType = "";
    if (entryDetails.collectionId) {
      currentAuthType = Authorization.Type.INHERIT;
    } else {
      currentAuthType = Authorization.Type.NO_AUTH;
    }
    entryCopy.auth = { currentAuthType };
  }

  if (entryCopy.auth.currentAuthType === Authorization.Type.INHERIT) {
    authOptions = inheritAuth(entryCopy, entryDetails, allRecords);
  }

  if (!authOptions) {
    return {
      headers: [],
      queryParams: [],
    };
  }

  return processAuthOptions(authOptions);
};

function inheritAuth(
  entry: RQAPI.Record["data"],
  entryDetails: {
    id: RQAPI.Record["id"];
    collectionId: RQAPI.Record["collectionId"];
  },
  allRecords: RQAPI.Record[]
) {
  const parentRecord = entryDetails.collectionId
    ? allRecords.find((record) => record.id === entryDetails.collectionId)
    : null;
  if (!parentRecord) {
    return null;
  }
  let parentAuthData = parentRecord.data.auth;
  if (!isEmpty(parentAuthData) && parentAuthData.currentAuthType === Authorization.Type.INHERIT) {
    const parentDetails = {
      id: parentRecord.id,
      collectionId: parentRecord.collectionId,
    };
    parentAuthData = inheritAuth(parentRecord.data, parentDetails, allRecords);
  }
  return parentAuthData;
}

const processAuthOptions = (authOptions: RQAPI.Auth) => {
  const headers: KeyValuePair[] = [];
  const queryParams: KeyValuePair[] = [];

  const { currentAuthType = "" } = authOptions;

  let newKeyValuePair: KeyValuePair;

  const createAuthorizationKeyValuePair = (type: string, key: string, value: string): typeof newKeyValuePair => ({
    id: Date.now(),
    key,
    value,
    type,
    isEnabled: true,
  });

  const updateDataInState = (data: KeyValuePair[], key: string, value: string) => {
    const existingIndex = data.findIndex((option) => option.type === AUTH_ENTRY_IDENTIFIER);
    const newOption = createAuthorizationKeyValuePair(AUTH_ENTRY_IDENTIFIER, key, value);

    if (existingIndex !== -1) {
      data[existingIndex] = { ...data[existingIndex], ...newOption };
    } else {
      data.unshift(newOption);
    }
  };

  switch (currentAuthType) {
    case Authorization.Type.INHERIT:
      throw new Error("Inherit auth type should not be processed inside processAuthOptions");
    case Authorization.Type.NO_AUTH:
      break;
    case Authorization.Type.BASIC_AUTH: {
      const { username, password } = authOptions.authConfigStore[currentAuthType] as BASIC_AUTH_FORM_VALUES;
      updateDataInState(headers, "Authorization", `Basic ${btoa(`${username || ""}:${password || ""}`)}`);
      break;
    }
    case Authorization.Type.BEARER_TOKEN: {
      const { bearer } = authOptions.authConfigStore[currentAuthType] as BEARER_TOKEN_FORM_VALUES;
      updateDataInState(headers, "Authorization", `Bearer ${bearer}`);
      break;
    }
    case Authorization.Type.API_KEY: {
      const { key, value, addTo } = authOptions.authConfigStore[currentAuthType] as API_KEY_FORM_VALUES;

      updateDataInState(addTo === "QUERY" ? queryParams : headers, key || "", value || "");

      break;
    }
    default:
      break;
  }

  return {
    headers,
    queryParams,
  };
};

export const updateRequestWithAuthOptions = (data: KeyValuePair[], dataToAdd: KeyValuePair[]) => {
  if (isEmpty(dataToAdd)) {
    return data;
  }

  const filterDataWithKeys = dataToAdd.filter((data) => data.key);

  // Mergin using key so that headers/queryparams aren't appended multiple times
  return unionBy(data, filterDataWithKeys, (item) => item?.key?.toLowerCase());
};
