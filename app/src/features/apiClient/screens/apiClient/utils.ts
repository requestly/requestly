import { getAPIResponse as getAPIResponseViaExtension } from "actions/ExtensionActions";
import { getAPIResponse as getAPIResponseViaProxy } from "actions/DesktopActions";
import { KeyValuePair, QueryParamSyncType, RQAPI, RequestContentType, RequestMethod } from "../../types";
import { CONSTANTS } from "@requestly/requestly-core";
import { CONTENT_TYPE_HEADER, DEMO_API_URL, SESSION_STORAGE_EXPANDED_RECORD_IDS_KEY } from "../../constants";
import * as curlconverter from "curlconverter";
import { upsertApiRecord } from "backend/apiClient";
import { forEach, isEmpty, split, unionBy } from "lodash";
import { sessionStorage } from "utils/sessionStorage";
import { Request as HarRequest } from "har-format";

export const makeRequest = async (
  appMode: string,
  request: RQAPI.Request,
  signal?: AbortSignal
): Promise<RQAPI.Response> => {
  return new Promise((resolve, reject) => {
    if (signal) {
      if (signal.aborted) {
        reject(new Error("Request aborted"));
      }

      const abortListener = () => {
        signal.removeEventListener("abort", abortListener);
        reject(new Error("Request aborted"));
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
    .filter((pair) => pair.key?.length > 0 && (!removeDisabledKeys || pair.isEnabled));
};

export const supportsRequestBody = (method: RequestMethod): boolean => {
  return ![RequestMethod.GET, RequestMethod.HEAD].includes(method);
};

export const generateKeyValuePairsFromJson = (json: Record<string, string> = {}): KeyValuePair[] => {
  return Object.entries(json || {}).map(([key, value, isEnabled = true]) => {
    return {
      key: key || "",
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

    const queryParamsFromJson = generateKeyValuePairsFromJson(requestJson.queries);
    /*
      cURL converter is not able to parse query params from url for some cURL requests
      so parsing it manually from URL and populating queryParams property
    */
    const requestUrlParams = new URL(requestJson.url).searchParams;
    const paramsFromUrl = generateKeyValuePairsFromJson(Object.fromEntries(requestUrlParams.entries()));

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

    // remove query params from url
    const requestUrl = requestJson.url.split("?")[0];

    const request: RQAPI.Request = {
      url: requestUrl,
      method: requestJson.method.toUpperCase() as RequestMethod,
      queryParams: queryParamsFromJson.length ? queryParamsFromJson : paramsFromUrl,
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

const sortRecords = (records: RQAPI.Record[]) => {
  return records.sort((a, b) => {
    // Sort by type first
    const typeComparison = a.type.localeCompare(b.type);
    if (typeComparison !== 0) return typeComparison;

    // If types are the same, sort alphabetically by name
    return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
  });
};

const sortNestedRecords = (records: RQAPI.Record[]) => {
  records.forEach((record) => {
    if (isApiCollection(record)) {
      record.data.children = sortRecords(record.data.children);
      sortNestedRecords(record.data.children);
    }
  });
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

  sortNestedRecords(updatedRecords);
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
  const enabledParams = queryParams.filter((param) => param.isEnabled ?? true);

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
      const updatedUrl = queryParamsToURLString(queryParams, url);

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
        if (!(queryParam.isEnabled ?? true)) {
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

export const filterRecordsBySearch = (records: RQAPI.Record[], searchValue: string): RQAPI.Record[] => {
  if (!searchValue) return records;

  const search = searchValue.toLowerCase();
  const matchingRecords = new Set<string>();

  const childrenMap = new Map<string, Set<string>>();
  const parentMap = new Map<string, string>();

  records.forEach((record) => {
    if (record.collectionId) {
      parentMap.set(record.id, record.collectionId);
      if (!childrenMap.has(record.collectionId)) {
        childrenMap.set(record.collectionId, new Set());
      }
      childrenMap.get(record.collectionId).add(record.id);
    }
  });

  // Add all children records of a collection
  const addChildrenRecords = (collectionId: string) => {
    const children = childrenMap.get(collectionId) || new Set();
    children.forEach((childId) => {
      matchingRecords.add(childId);
      if (childrenMap.has(childId)) {
        addChildrenRecords(childId);
      }
    });
  };

  // Add all parent collections of a record
  const addParentCollections = (recordId: string) => {
    const parentId = parentMap.get(recordId);
    if (parentId) {
      matchingRecords.add(parentId);
      addParentCollections(parentId);
    }
  };

  // First pass: direct matches and their children
  records.forEach((record) => {
    if (record.name.toLowerCase().includes(search)) {
      matchingRecords.add(record.id);

      // If collection matches, add all children records
      if (isApiCollection(record)) {
        addChildrenRecords(record.id);
      }
    }
  });

  // Second pass: add parent collections
  matchingRecords.forEach((id) => {
    addParentCollections(id);
  });

  return records.filter((record) => matchingRecords.has(record.id));
};

export const clearExpandedRecordIdsFromSession = (keysToBeDeleted: string[]) => {
  const activeKeys = sessionStorage.getItem(SESSION_STORAGE_EXPANDED_RECORD_IDS_KEY, []);

  if (keysToBeDeleted.length === 0) {
    return;
  }

  const updatedActiveKeys: string[] = [];

  activeKeys.forEach((key: string) => {
    if (!keysToBeDeleted.includes(key)) updatedActiveKeys.push(key);
  });

  sessionStorage.setItem(SESSION_STORAGE_EXPANDED_RECORD_IDS_KEY, updatedActiveKeys);
};

const getParentIds = (data: RQAPI.Record[], targetId: RQAPI.Record["id"]) => {
  const idToCollectionMap = data.reduce((collectionIdMap: Record<RQAPI.Record["id"], RQAPI.Record["id"]>, item) => {
    collectionIdMap[item.id] = item.collectionId || "";
    return collectionIdMap;
  }, {});

  const parentIds = [];

  let currentId = idToCollectionMap[targetId];
  while (currentId) {
    parentIds.push(currentId);
    currentId = idToCollectionMap[currentId];
  }

  return parentIds;
};

export const getRecordIdsToBeExpanded = (
  id: RQAPI.Record["id"],
  expandedKeys: RQAPI.Record["id"][],
  records: RQAPI.Record[]
) => {
  // If the provided ID is null or undefined, return the existing active keys.
  if (!id) {
    return expandedKeys;
  }

  const expandedKeysCopy = [...expandedKeys];

  const parentIds = getParentIds(records, id);

  // Include the original ID itself as an active key.
  parentIds.push(id);

  parentIds.forEach((parent) => {
    if (!expandedKeysCopy.includes(parent)) {
      expandedKeysCopy.push(parent);
    }
  });

  return expandedKeysCopy;
};

export const apiRequestToHarRequestAdapter = (apiRequest: RQAPI.Request): HarRequest => {
  const harRequest: HarRequest = {
    method: apiRequest.method,
    url: apiRequest.url,
    headers: apiRequest.headers.map(({ key, value }) => ({ name: key, value })),
    queryString: apiRequest.queryParams.map(({ key, value }) => ({ name: key, value })),
    httpVersion: "HTTP/1.1",
    cookies: [],
    bodySize: -1,
    headersSize: -1,
  };

  if (supportsRequestBody(apiRequest.method)) {
    if (apiRequest?.contentType === RequestContentType.RAW) {
      harRequest.postData = {
        mimeType: RequestContentType.RAW,
        text: apiRequest.body as string,
      };
    } else if (apiRequest?.contentType === RequestContentType.JSON) {
      harRequest.postData = {
        mimeType: RequestContentType.JSON,
        text: apiRequest.body as string,
      };
    } else if (apiRequest?.contentType === RequestContentType.FORM) {
      harRequest.postData = {
        mimeType: RequestContentType.FORM,
        params: (apiRequest.body as KeyValuePair[]).map(({ key, value }) => ({ name: key, value })),
      };
    }
  }

  return harRequest;
};
