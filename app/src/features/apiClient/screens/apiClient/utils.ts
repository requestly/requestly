import { getAPIResponse as getAPIResponseViaExtension } from "actions/ExtensionActions";
import { getAPIResponse as getAPIResponseViaProxy } from "actions/DesktopActions";
import { KeyValuePair, QueryParamSyncType, RQAPI, RequestContentType, RequestMethod } from "../../types";
import { CONSTANTS } from "@requestly/requestly-core";
import { CONTENT_TYPE_HEADER, DEMO_API_URL } from "../../constants";
import * as curlconverter from "curlconverter";
import { upsertApiRecord } from "backend/apiClient";
import { forEach, isEmpty, split, unionBy } from "lodash";
import { sessionStorage } from "utils/sessionStorage";

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

export const sanitizeEntry = (entry: RQAPI.Entry, removeDisabledKeys = true) => {
  const sanitizedEntry: RQAPI.Entry = {
    ...entry,
    request: {
      ...entry.request,
      queryParams: sanitizeKeyValuePairs(entry.request.queryParams, removeDisabledKeys),
      headers: sanitizeKeyValuePairs(entry.request.headers, removeDisabledKeys),
    },
    scripts: {
      preRequest: entry.scripts?.preRequest || "",
      postResponse: entry.scripts?.postResponse || "",
    },
  };

  if (!supportsRequestBody(entry.request.method)) {
    sanitizedEntry.request.body = null;
  } else if (entry.request.contentType === RequestContentType.FORM) {
    sanitizedEntry.request.body = sanitizeKeyValuePairs(
      sanitizedEntry.request.body as KeyValuePair[],
      removeDisabledKeys
    );
  }

  return sanitizedEntry;
};

export const sanitizeKeyValuePairs = (keyValuePairs: KeyValuePair[], removeDisabledKeys = true): KeyValuePair[] => {
  return keyValuePairs
    .map((pair) => ({
      ...pair,
      isEnabled: pair.isEnabled ?? true,
    }))
    .filter((pair) => pair.key.length > 0 && (!removeDisabledKeys || pair.isEnabled));
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
      body: body ?? null,
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

export const createBlankApiRecord = (
  uid: string,
  teamId: string,
  recordType: RQAPI.RecordType,
  collectionId: string
) => {
  const newRecord: Partial<RQAPI.Record> = {};

  if (recordType === RQAPI.RecordType.API) {
    newRecord.name = "Untitled request";
    newRecord.type = RQAPI.RecordType.API;
    newRecord.data = getEmptyAPIEntry();
    newRecord.deleted = false;
    newRecord.collectionId = collectionId;
  }

  if (recordType === RQAPI.RecordType.COLLECTION) {
    newRecord.name = "New collection";
    newRecord.type = RQAPI.RecordType.COLLECTION;
    newRecord.data = { variables: {} };
    newRecord.deleted = false;
    newRecord.collectionId = collectionId;
  }

  return upsertApiRecord(uid, newRecord, teamId);
};

export const extractQueryParams = (inputString: string) => {
  const queryParams: KeyValuePair[] = [];

  inputString = split(inputString, "?")[1];

  if (inputString) {
    const queryParamsList = split(inputString, "&");
    forEach(queryParamsList, (queryParam) => {
      const queryParamValues = split(queryParam, "=");
      queryParams.push({
        id: Math.random(),
        key: queryParamValues[0],
        value: queryParamValues[1],
        isEnabled: true,
      });
    });
  }

  return queryParams;
};

export const queryParamsToURLString = (queryParams: KeyValuePair[], inputString: string) => {
  if (isEmpty(queryParams)) {
    return inputString;
  }
  const baseUrl = split(inputString, "?")[0];
  const enabledParams = queryParams.filter((param) => param.isEnabled);

  const queryString = enabledParams
    .map(({ key, value }) => {
      if (!key) return "";
      if (value === undefined || value === "") {
        return key;
      } else {
        return `${key}=${value}`;
      }
    })
    .filter(Boolean)
    .join("&");

  return `${baseUrl}${queryString ? `?${queryString}` : queryString}`;
};

export const syncQueryParams = (
  queryParams: KeyValuePair[],
  url: string,
  type: QueryParamSyncType = QueryParamSyncType.SYNC
) => {
  const updatedQueryParams = extractQueryParams(url);

  switch (type) {
    case QueryParamSyncType.SYNC: {
      const updatedUrl = queryParamsToURLString(updatedQueryParams, url);

      // Dont sync if URL is same
      if (updatedUrl !== url) {
        const combinedParams = unionBy(queryParams, updatedQueryParams, "id");
        const deduplicatedParams: KeyValuePair[] = [];
        const seenPairs = new Set();

        combinedParams.forEach((param) => {
          const pair = `${param.key}=${param.value}`;
          if (!seenPairs.has(pair)) {
            seenPairs.add(pair);
            deduplicatedParams.push(param);
          }
        });

        return { queryParams: deduplicatedParams, url: queryParamsToURLString(deduplicatedParams, url) };
      }

      return { queryParams, url };
    }
    case QueryParamSyncType.TABLE: {
      const updatedQueryParamsCopy = [...updatedQueryParams];

      // Adding disabled key value pairs
      queryParams.forEach((queryParam, index) => {
        if (!queryParam.isEnabled) {
          updatedQueryParamsCopy.splice(index, 0, queryParam);
        }
      });

      return {
        queryParams: isEmpty(updatedQueryParamsCopy) ? [getEmptyPair()] : updatedQueryParamsCopy,
      };
    }

    case QueryParamSyncType.URL: {
      const updatedUrl = queryParamsToURLString(queryParams, url);

      return { url: updatedUrl };
    }

    default:
      return {
        queryParams,
        url,
      };
  }
};

export const clearActiveKeysFromSession = (keysToBeDeleted: string[]) => {
  const activeKeys = sessionStorage.getItem("active_collection_keys", []);

  if (keysToBeDeleted.length === 0) {
    return;
  }

  const updatedActiveKeys: string[] = [];

  activeKeys.forEach((key: string) => {
    if (!keysToBeDeleted.includes(key)) updatedActiveKeys.push(key);
  });

  sessionStorage.setItem("active_collection_keys", updatedActiveKeys);
};

export const updateActiveKeys = (records: RQAPI.Record[], id: RQAPI.Record["id"], activeKeys: RQAPI.Record["id"][]) => {
  if (!id) {
    return activeKeys;
  }

  function getParents(
    records: RQAPI.Record[],
    startId: RQAPI.Record["id"],
    getRelatedId: (record: RQAPI.Record, currentId: RQAPI.Record["id"]) => RQAPI.Record["id"]
  ) {
    const relatedIds: RQAPI.Record["id"][] = [];
    const visited = new Set();
    const stack = [startId];

    while (stack.length > 0) {
      const currentId = stack.pop();
      if (visited.has(currentId)) continue;
      visited.add(currentId);

      records.forEach((record) => {
        const relatedId = getRelatedId(record, currentId);
        if (relatedId) {
          relatedIds.push(relatedId);
          stack.push(relatedId);
        }
      });
    }

    return relatedIds;
  }

  const updatedActiveKeys = [...activeKeys];

  const parents = getParents(records, id, (record, currentId) => {
    return record.id === currentId ? record.collectionId : null;
  });
  parents.push(id);

  parents.forEach((ancestor) => {
    if (!updatedActiveKeys.includes(ancestor)) {
      updatedActiveKeys.push(ancestor);
    }
  });

  return updatedActiveKeys;
};
