import { EnvironmentVariables, EnvironmentVariableType } from "backend/environment/types";
import { RQAPI } from "../types";
import {
  isApiRequest,
  isApiCollection,
  filterRecordsBySearch,
  convertFlatRecordsToNestedRecords,
  filterOutChildrenRecords,
  sortRecords,
} from "../screens/apiClient/utils";
import { getApiClientFeatureContext, getChildParentMap } from "./store.utils";
import { isEmpty } from "lodash";

export function sanitizePatch(patch: EnvironmentVariables) {
  return Object.fromEntries(
    Object.entries(patch).map(([key, value], index) => {
      const typeToSaveInDB =
        value.type === EnvironmentVariableType.Secret
          ? EnvironmentVariableType.Secret
          : (typeof value.syncValue as EnvironmentVariableType);
      return [
        key.trim(),
        { localValue: value.localValue, syncValue: value.syncValue, type: typeToSaveInDB, id: index },
      ];
    })
  );
}

export function addNestedCollection(
  record: RQAPI.CollectionRecord,
  newSelectedRecords: Set<RQAPI.ApiClientRecord["id"]>
) {
  newSelectedRecords.add(record.id);
  if (record.data.children) {
    record.data.children.forEach((child) => {
      if (child.type === "collection") {
        addNestedCollection(child, newSelectedRecords);
      } else {
        newSelectedRecords.add(child.id);
      }
    });
  }
}

export function prepareRecordsToRender(records: RQAPI.ApiClientRecord[]) {
  const { updatedRecords, recordsMap } = convertFlatRecordsToNestedRecords(records);

  const sortedRecords = sortRecords(updatedRecords);

  return {
    count: sortedRecords.length,
    collections: sortedRecords.filter((record) => isApiCollection(record)) as RQAPI.CollectionRecord[],
    requests: sortedRecords.filter((record) => isApiRequest(record)) as RQAPI.ApiRecord[],
    recordsMap: recordsMap,
  };
}

export function getRecordsToExpandBySearchValue(params: {
  contextId: string;
  apiClientRecords: RQAPI.ApiClientRecord[];
  searchValue?: string;
}): undefined | RQAPI.ApiClientRecord["id"][] {
  const { contextId, apiClientRecords, searchValue } = params;

  if (!searchValue) {
    return;
  }

  const context = getApiClientFeatureContext(contextId);
  const childParentMap = getChildParentMap(context);
  const filteredRecords = filterRecordsBySearch(apiClientRecords, searchValue);

  const recordsToExpand: string[] = [];
  filteredRecords.forEach((record) => {
    if (record.collectionId) {
      recordsToExpand.push(record.collectionId);
      let parentId = childParentMap.get(record.collectionId);
      while (parentId) {
        recordsToExpand.push(parentId);
        parentId = childParentMap.get(parentId);
      }
    }
  });

  return recordsToExpand;
}

export function getRecordsToRender(params: { apiClientRecords: RQAPI.ApiClientRecord[]; searchValue?: string }) {
  const { apiClientRecords, searchValue } = params;

  const filteredRecords = filterRecordsBySearch(apiClientRecords, searchValue);
  const recordsToRender = prepareRecordsToRender(filteredRecords);

  return recordsToRender;
}

export function selectAllRecords(params: { contextId: string; searchValue: string }) {
  const { contextId, searchValue } = params;

  const newSelectedRecords: Set<RQAPI.ApiClientRecord["id"]> = new Set();

  const context = getApiClientFeatureContext(contextId);
  const apiClientRecords = context.stores.records.getState().apiClientRecords;

  const records = getRecordsToRender({
    apiClientRecords,
    searchValue,
  });

  records.collections.forEach((record) => {
    addNestedCollection(record, newSelectedRecords);
  });

  records.requests.forEach((record) => {
    newSelectedRecords.add(record.id);
  });

  return newSelectedRecords;
}

export function getProcessedRecords(contextId: string, selectedRecords: Set<RQAPI.ApiClientRecord["id"]>) {
  const context = getApiClientFeatureContext(contextId);

  const childParentMap = getChildParentMap(context);
  const apiClientRecords = context.stores.records.getState().apiClientRecords;
  const records = getRecordsToRender({ apiClientRecords });

  return filterOutChildrenRecords(selectedRecords, childParentMap, records.recordsMap);
}

export const getCollectionOptionsToMoveIn = (contextId: string, recordsToMove: RQAPI.ApiClientRecord[]) => {
  const context = getApiClientFeatureContext(contextId);
  const apiClientRecords = context.stores.records.getState().apiClientRecords;

  const exclusions = new Set();

  for (const record of recordsToMove) {
    const stack = [record];
    record.collectionId && exclusions.add(record.collectionId);
    while (stack.length) {
      const current = stack.pop();
      exclusions.add(current?.id);

      if (current && isApiCollection(current) && !isEmpty(current.data?.children)) {
        stack.push(...current.data.children!); // non-null assertion as we check for emptiness in the if condition
      }
    }
  }

  const collections = apiClientRecords
    .filter((record) => isApiCollection(record) && !exclusions.has(record.id))
    .map((record) => ({
      label: record.name,
      value: record.id,
    }));

  return collections;
};

export function getAllRecords(records: RQAPI.ApiClientRecord[]): RQAPI.ApiClientRecord[] {
  const result: RQAPI.ApiClientRecord[] = [];
  const stack: RQAPI.ApiClientRecord[] = [...records];

  while (stack.length) {
    const record = stack.pop();
    if (record) {
      result.push(record);
      if (isApiCollection(record) && record.data.children) {
        stack.push(...record.data.children);
      }
    }
  }

  return result;
}
