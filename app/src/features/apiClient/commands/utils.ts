import { EnvironmentVariables, EnvironmentVariableType } from "backend/environment/types";
import { RQAPI } from "../types";
import { apiClientFeatureContextProviderStore } from "../store/apiClientFeatureContext/apiClientFeatureContext.store";
import {
  isApiRequest,
  isApiCollection,
  filterRecordsBySearch,
  convertFlatRecordsToNestedRecords,
} from "../screens/apiClient/utils";

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

export function getChildParentMap(contextId: string) {
  const context = apiClientFeatureContextProviderStore.getState().getContext(contextId);
  return context.stores.records.getState().childParentMap;
}

export function prepareRecordsToRender(records: RQAPI.ApiClientRecord[]) {
  const { updatedRecords, recordsMap } = convertFlatRecordsToNestedRecords(records);

  updatedRecords.sort((recordA, recordB) => {
    // If different type, then keep collection first
    if (recordA.type === RQAPI.RecordType.COLLECTION && recordA.isExample) {
      return -1;
    }

    if (recordB.type === RQAPI.RecordType.COLLECTION && recordB.isExample) {
      return -1;
    }

    if (recordA.type !== recordB.type) {
      return recordA.type === RQAPI.RecordType.COLLECTION ? -1 : 1;
    }

    // If types are the same, sort lexicographically by name
    if (recordA.name.toLowerCase() !== recordB.name.toLowerCase()) {
      return recordA.name.toLowerCase() < recordB.name.toLowerCase() ? -1 : 1;
    }

    // If names are the same, sort by creation date
    return recordA.createdTs - recordB.createdTs;
  });

  return {
    count: updatedRecords.length,
    collections: updatedRecords.filter((record) => isApiCollection(record)) as RQAPI.CollectionRecord[],
    requests: updatedRecords.filter((record) => isApiRequest(record)) as RQAPI.ApiRecord[],
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

  const childParentMap = getChildParentMap(contextId);
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

  const context = apiClientFeatureContextProviderStore.getState().getContext(contextId);
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
