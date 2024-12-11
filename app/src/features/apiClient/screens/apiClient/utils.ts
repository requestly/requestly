import { getAPIResponse as getAPIResponseViaExtension } from "actions/ExtensionActions";
import { getAPIResponse as getAPIResponseViaProxy } from "actions/DesktopActions";
import { KeyValuePair, RQAPI, RequestContentType, RequestMethod } from "../../types";
// @ts-ignore
import { CONSTANTS } from "@requestly/requestly-core";
import { CONTENT_TYPE_HEADER, DEMO_API_URL } from "../../constants";
import * as curlconverter from "curlconverter";
import { AUTHORIZATION_TYPES } from "./components/clientView/components/request/components/AuthorizationView/authStaticData";
import { isEmpty, noop } from "lodash";

export const makeRequest = async (
  appMode: string,
  request: RQAPI.Request,
  signal?: AbortSignal
): Promise<RQAPI.Response> => {
  return new Promise((resolve, reject) => {
    if (signal) {
      if (signal.aborted) {
        reject();
      }

      const abortListener = () => {
        signal.removeEventListener("abort", abortListener);
        reject();
      };
      signal.addEventListener("abort", abortListener);
    }

    if (appMode === CONSTANTS.APP_MODES.EXTENSION) {
      getAPIResponseViaExtension(request).then(resolve);
    } else if (appMode === CONSTANTS.APP_MODES.DESKTOP) {
      getAPIResponseViaProxy(request).then(resolve);
    } else {
      resolve(null);
    }
  });
};

// TODO: move this into top level common folder
export const addUrlSchemeIfMissing = (url: string): string => {
  if (url && !/^([a-z][a-z0-9+\-.]*):\/\//.test(url)) {
    return "http://" + url;
  }

  return url;
};

export const getEmptyAPIEntry = (request?: RQAPI.Request): RQAPI.Entry => {
  return {
    request: {
      url: DEMO_API_URL,
      queryParams: [],
      method: RequestMethod.GET,
      headers: [],
      body: null,
      contentType: RequestContentType.RAW,
      ...(request || {}),
    },
    response: null,
  };
};

export const sanitizeKeyValuePairs = (
  keyValuePairs: KeyValuePair[],
  removeDisabledKeys = true,
  excludeAuthOptions = true
): KeyValuePair[] => {
  return keyValuePairs
    .map((pair) => ({
      ...pair,
      isEnabled: pair.isEnabled ?? true,
    }))
    .filter(
      (pair) =>
        pair.key.length > 0 &&
        (excludeAuthOptions ? pair.type !== "auth" : true) &&
        (!removeDisabledKeys || pair.isEnabled)
    );
};

export const supportsRequestBody = (method: RequestMethod): boolean => {
  return ![RequestMethod.GET, RequestMethod.HEAD].includes(method);
};

export const generateKeyValuePairsFromJson = (json: Record<string, string> = {}): KeyValuePair[] => {
  return Object.entries(json || {}).map(([key, value, isEnabled = true]) => {
    return {
      key,
      value,
      id: Math.random(),
      isEnabled,
    };
  });
};

export const getContentTypeFromRequestHeaders = (headers: KeyValuePair[]): RequestContentType => {
  const contentTypeHeader = headers.find((header) => header.key.toLowerCase() === CONTENT_TYPE_HEADER.toLowerCase());
  const contentTypeHeaderValue = contentTypeHeader?.value as RequestContentType;

  const contentType: RequestContentType =
    contentTypeHeaderValue && Object.values(RequestContentType).find((type) => contentTypeHeaderValue.includes(type));

  return contentType || RequestContentType.RAW;
};

export const getContentTypeFromResponseHeaders = (headers: KeyValuePair[]): string => {
  return headers.find((header) => header.key.toLowerCase() === CONTENT_TYPE_HEADER.toLowerCase())?.value;
};

export const filterHeadersToImport = (headers: KeyValuePair[]) => {
  return headers.filter((header) => {
    // exclude headers dependent on original source
    if (["host", "accept-encoding"].includes(header.key.toLowerCase())) {
      return false;
    }

    // exclude pseudo headers
    if (header.key.startsWith(":")) {
      return false;
    }

    return true;
  });
};

export const parseCurlRequest = (curl: string): RQAPI.Request => {
  try {
    const requestJsonString = curlconverter.toJsonString(curl);
    const requestJson = JSON.parse(requestJsonString);
    // console.log("converted", {curl, requestJson});

    const queryParams = generateKeyValuePairsFromJson(requestJson.queries);
    const headers = filterHeadersToImport(generateKeyValuePairsFromJson(requestJson.headers));
    const contentType = getContentTypeFromRequestHeaders(headers);
    let body: RQAPI.RequestBody;

    if (contentType === RequestContentType.JSON) {
      body = JSON.stringify(requestJson.data);
    } else if (contentType === RequestContentType.FORM) {
      body = generateKeyValuePairsFromJson(requestJson.data);
    } else {
      body = requestJson.data ?? null; // Body can be undefined which throws an error while saving the request in firestore
    }

    const request: RQAPI.Request = {
      url: requestJson.url,
      method: requestJson.method.toUpperCase() as RequestMethod,
      queryParams,
      headers,
      contentType,
      body,
    };
    return request;
  } catch (e) {
    return null;
  }
};

export const isApiRequest = (record: RQAPI.Record) => {
  return record.type === RQAPI.RecordType.API;
};

export const isApiCollection = (record: RQAPI.Record) => {
  return record?.type === RQAPI.RecordType.COLLECTION;
};

export const convertFlatRecordsToNestedRecords = (records: RQAPI.Record[]) => {
  const recordsCopy = [...records];
  const recordsMap: Record<string, RQAPI.Record> = {};
  const updatedRecords: RQAPI.Record[] = [];

  recordsCopy.forEach((record) => {
    if (isApiCollection(record)) {
      recordsMap[record.id] = {
        ...record,
        data: { ...record.data, children: [] },
      };
    } else if (isApiRequest(record)) {
      recordsMap[record.id] = record;
    }
  });

  recordsCopy.forEach((record) => {
    const recordState = recordsMap[record.id];
    if (record.collectionId) {
      const parentNode = recordsMap[record.collectionId] as RQAPI.CollectionRecord;
      if (parentNode) {
        parentNode.data.children.push(recordState);
      }
    } else {
      updatedRecords.push(recordState);
    }
  });

  return updatedRecords;
};
export const getEmptyPair = (): KeyValuePair => ({ id: Math.random(), key: "", value: "", isEnabled: true });

export const appendAuthOptions = (apiEntry, updateEntry = noop, selectedForm, formValues = {}, value, id) => {
  const createAuthorizationHeader = (type, key = null, value = null, id = null) => ({
    id: Math.random(),
    key,
    value,
    type,
    isEnabled: true,
    ...(id ? { [id]: value } : {}),
  });

  const updateHeadersInState = (headers, type, key, value, selectorId = null) => {
    const existingIndex = headers.findIndex((header) => header.type === type);
    const newHeader = createAuthorizationHeader(type, key, value, selectorId);

    if (existingIndex !== -1) {
      headers[existingIndex] = { ...headers[existingIndex], ...newHeader };
    } else {
      headers.unshift(newHeader);
    }
  };

  const currentFormValues = {
    ...formValues[selectedForm],
    ...(id || value ? { [id]: value } : {}),
  };

  const headersState = [...apiEntry.request.headers];
  const queriesState = [...apiEntry.request.queryParams];
  const { addTo, key, bearer, username, password } = currentFormValues;

  switch (selectedForm) {
    case AUTHORIZATION_TYPES.API_KEY:
      updateHeadersInState(
        addTo === "QUERY" ? queriesState : headersState,
        "auth",
        key || "",
        currentFormValues.value || ""
      );
      break;

    case AUTHORIZATION_TYPES.BEARER_TOKEN:
      updateHeadersInState(headersState, "auth", "Authorization", `Bearer ${bearer}`);
      break;

    case AUTHORIZATION_TYPES.BASIC_AUTH:
      updateHeadersInState(
        headersState,
        "auth",
        "Authorization",
        `Basic ${btoa(`${username || ""}:${password || ""}`)}`
      );
      break;

    default:
      break;
  }

  updateEntry((prev) => ({
    ...prev,
    request: {
      ...prev.request,
      ...(addTo === "QUERY"
        ? {
            queryParams: queriesState,
            headers: prev.request.headers.filter((header) => header.type !== "auth"),
          }
        : {
            headers: headersState,
            queryParams: prev.request.queryParams.filter((query) => query.type !== "auth"),
          }),
    },
    auth: {
      currentAuthType: selectedForm,
      authOptions: {
        ...formValues,
        [selectedForm]: { ...formValues[selectedForm], ...currentFormValues },
      },
    },
  }));
};
