import { EnvironmentVariables, EnvironmentVariableType } from "backend/environment/types";
import { EnvironmentVariableData } from "@requestly/shared/types/entities/apiClient";
import { RQAPI } from "../types";
import {
  isApiRequest,
  isApiCollection,
  filterRecordsBySearch,
  convertFlatRecordsToNestedRecords,
  filterOutChildrenRecords,
} from "../screens/apiClient/utils";
import { isEmpty } from "lodash";
import { selectAllRecords as selectAllRecordsFromSlice, selectChildToParent } from "../slices/apiRecords/selectors";
import { Workspace } from "features/workspaces/types";
import { getApiClientFeatureContext, WorkspaceInfo } from "../slices";
import { apiRecordsRankingManager } from "../helpers/RankingManager";

export const NoopContextId = "__stub_context_id";

export function sanitizePatch(patch: EnvironmentVariables) {
  return Object.fromEntries(
    Object.entries(patch).map(([key, value]: [string, EnvironmentVariableData], index) => {
      const typeToSaveInDB =
        value.type === EnvironmentVariableType.Secret
          ? EnvironmentVariableType.Secret
          : (typeof value.syncValue as EnvironmentVariableType);
      return [
        key.trim(),
        { localValue: value.localValue ?? "", syncValue: value.syncValue ?? "", type: typeToSaveInDB, id: index },
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
    const rankA = apiRecordsRankingManager.getEffectiveRank(recordA);
    const rankB = apiRecordsRankingManager.getEffectiveRank(recordB);
    return apiRecordsRankingManager.compareFn(rankA, rankB);
  });

  return {
    count: updatedRecords.length,
    collections: updatedRecords.filter((record) => isApiCollection(record)) as RQAPI.CollectionRecord[],
    requests: updatedRecords.filter((record) => isApiRequest(record)) as RQAPI.ApiRecord[],
    recordsMap: recordsMap,
  };
}

export function getRecordsToExpandBySearchValue(params: {
  contextId: WorkspaceInfo["id"];
  apiClientRecords: RQAPI.ApiClientRecord[];
  searchValue?: string;
}): undefined | RQAPI.ApiClientRecord["id"][] {
  const { contextId, apiClientRecords, searchValue } = params;

  if (!searchValue) {
    return;
  }

  const context = getApiClientFeatureContext(contextId);
  const state = context?.store.getState();
  const childParentMap = state ? selectChildToParent(state) : {};
  const filteredRecords = filterRecordsBySearch(apiClientRecords, searchValue);

  const recordsToExpand: string[] = [];
  filteredRecords.forEach((record) => {
    if (record.collectionId) {
      recordsToExpand.push(record.collectionId);
      let parentId = childParentMap[record.collectionId];
      while (parentId) {
        recordsToExpand.push(parentId);
        parentId = childParentMap[parentId];
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

export function selectAllRecords(params: { contextId: WorkspaceInfo["id"]; searchValue: string }) {
  const { contextId, searchValue } = params;

  const newSelectedRecords: Set<RQAPI.ApiClientRecord["id"]> = new Set();

  const context = getApiClientFeatureContext(contextId);
  const state = context.store.getState();
  const apiClientRecords = selectAllRecordsFromSlice(state);

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
  const state = context.store.getState();

  const childParentMap = selectChildToParent(state);
  const apiClientRecords = selectAllRecordsFromSlice(state);
  const records = getRecordsToRender({ apiClientRecords });

  return filterOutChildrenRecords(selectedRecords, childParentMap, records.recordsMap);
}

export const getCollectionOptionsToMoveIn = (workspaceId: Workspace["id"], recordsToMove: RQAPI.ApiClientRecord[]) => {
  const context = getApiClientFeatureContext(workspaceId);
  const state = context.store.getState();
  const apiClientRecords = selectAllRecordsFromSlice(state);

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
