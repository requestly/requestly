import {
  convertFlatRecordsToNestedRecords,
  filterRecordsBySearch,
  isApiCollection,
  isApiRequest,
} from "features/apiClient/screens/apiClient/utils";
import { apiClientFeatureContextProviderStore } from "features/apiClient/store/apiClientFeatureContext/apiClientFeatureContext.store";
import { RQAPI } from "features/apiClient/types";

export const addNestedCollection = (
  record: RQAPI.CollectionRecord,
  newSelectedRecords: Set<RQAPI.ApiClientRecord["id"]>
) => {
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
};

export const getChildParentMap = (contextId: string) => {
  const currentContext = apiClientFeatureContextProviderStore.getState().getContext(contextId);
  return currentContext.stores.records.getState().childParentMap;
};

export const prepareRecordsToRender = (records: RQAPI.ApiClientRecord[]) => {
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
};

export const getUpdatedRecords = (params: {
  contextId: string;
  apiClientRecords: RQAPI.ApiClientRecord[];
  searchValue: string;
}) => {
  const { contextId, apiClientRecords, searchValue } = params;
  const childParentMap = getChildParentMap(contextId);

  const filteredRecords = filterRecordsBySearch(apiClientRecords, searchValue);
  const recordsToRender = prepareRecordsToRender(filteredRecords);

  if (searchValue) {
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

    // setExpandedRecordIds((prev: string[]) => {
    //   const newExpanded = prev.concat(recordsToExpand);
    //   return newExpanded;
    // });
  }
  return recordsToRender;
};

export const selectAllRecords = (params: { contextId: string; searchValue: string }) => {
  const { contextId, searchValue } = params;

  const newSelectedRecords: Set<RQAPI.ApiClientRecord["id"]> = new Set();

  const context = apiClientFeatureContextProviderStore.getState().getContext(contextId);
  const apiClientRecords = context.stores.records.getState().apiClientRecords;
  const updatedRecords = getUpdatedRecords({
    contextId,
    apiClientRecords,
    searchValue,
  });

  updatedRecords.collections.forEach((record) => {
    addNestedCollection(record, newSelectedRecords);
  });

  updatedRecords.requests.forEach((record) => {
    newSelectedRecords.add(record.id);
  });

  return newSelectedRecords;
};
