import { isEmpty, unionBy } from "lodash";
import {
  AUTHORIZATION_TYPES,
  GET_KEY_VALUE_PAIR_DESCRIPTION,
} from "../screens/apiClient/components/clientView/components/request/components/AuthorizationView/authStaticData";
import { AUTH_ENTRY_IDENTIFIER } from "../screens/apiClient/components/clientView/components/request/components/AuthorizationView/types";
import { KeyValuePair, RQAPI } from "../types";

export const processAuthOptions = (authOptions: RQAPI.AuthOptions) => {
  const headers: KeyValuePair[] = [];
  const queryParams: KeyValuePair[] = [];

  const { currentAuthType } = authOptions || {};

  let newKeyValuePair: KeyValuePair;

  const createAuthorizationKeyValuePair = (
    type: string,
    key: string,
    value: string,
    keyValuePairType = "header"
  ): typeof newKeyValuePair => ({
    id: Date.now(),
    key,
    value,
    type,
    isEnabled: true,
    isEditable: false,
    description: GET_KEY_VALUE_PAIR_DESCRIPTION(keyValuePairType),
  });

  const updateDataInState = (data: KeyValuePair[], key: string, value: string, keyValuePairType: string = "header") => {
    const existingIndex = data.findIndex((option) => option.type === AUTH_ENTRY_IDENTIFIER);
    const newOption = createAuthorizationKeyValuePair(AUTH_ENTRY_IDENTIFIER, key, value, keyValuePairType);

    if (existingIndex !== -1) {
      data[existingIndex] = { ...data[existingIndex], ...newOption };
    } else {
      data.unshift(newOption);
    }
  };

  switch (currentAuthType) {
    case AUTHORIZATION_TYPES.NO_AUTH:
      break;
    case AUTHORIZATION_TYPES.BASIC_AUTH: {
      const { username, password } = authOptions[currentAuthType];
      updateDataInState(headers, "Authorization", `Basic ${btoa(`${username || ""}:${password || ""}`)}`);
      break;
    }
    case AUTHORIZATION_TYPES.BEARER_TOKEN: {
      const { bearer } = authOptions[currentAuthType];
      updateDataInState(headers, "Authorization", `Bearer ${bearer}`);
      break;
    }
    case AUTHORIZATION_TYPES.API_KEY: {
      const { key, value, addTo } = authOptions[currentAuthType];

      updateDataInState(
        addTo === "QUERY" ? queryParams : headers,
        key || "",
        value || "",
        addTo === "QUERY" ? "query param" : "header"
      );

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
  return unionBy(data, dataToAdd, "type");
};
