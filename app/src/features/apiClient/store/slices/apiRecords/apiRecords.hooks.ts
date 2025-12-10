import { useMemo } from "react";
import { RQAPI } from "features/apiClient/types";
import { EntityId } from "../types";
import {
  selectAllRecords,
  selectRecordById,
  selectAncestorIds,
  selectAncestorRecords,
  selectChildrenIds,
  selectChildRecords,
  selectAllDescendantIds,
  selectRootRecords,
  selectCollections,
  selectApiRecords,
  selectTotalRecords,
  selectRecordsLoading,
  selectRecordsError,
  selectCollectionPath,
  makeSelectRecordById,
  makeSelectChildrenIds,
  makeSelectAncestorIds,
} from "./selectors";
import { useApiClientSelector } from "../../hooks/base.hooks";

export function useAllRecords(): RQAPI.ApiClientRecord[] {
  return useApiClientSelector(selectAllRecords);
}

export function useRecordById(id: EntityId): RQAPI.ApiClientRecord | undefined {
  return useApiClientSelector((state) => selectRecordById(state, id));
}

export function useRecordByIdMemoized(id: EntityId): RQAPI.ApiClientRecord | null {
  const selectRecord = useMemo(makeSelectRecordById, []);
  return useApiClientSelector((state) => selectRecord(state, id));
}

export function useAncestorIds(id: EntityId): EntityId[] {
  return useApiClientSelector((state) => selectAncestorIds(state, id));
}

export function useAncestorIdsMemoized(id: EntityId): EntityId[] {
  const selectAncestors = useMemo(makeSelectAncestorIds, []);
  return useApiClientSelector((state) => selectAncestors(state, id));
}

export function useAncestorRecords(id: EntityId): RQAPI.ApiClientRecord[] {
  return useApiClientSelector((state) => selectAncestorRecords(state, id));
}

export function useChildrenIds(id: EntityId): EntityId[] {
  return useApiClientSelector((state) => selectChildrenIds(state, id));
}

export function useChildrenIdsMemoized(id: EntityId): EntityId[] {
  const selectChildren = useMemo(makeSelectChildrenIds, []);
  return useApiClientSelector((state) => selectChildren(state, id));
}

export function useChildRecords(id: EntityId): RQAPI.ApiClientRecord[] {
  return useApiClientSelector((state) => selectChildRecords(state, id));
}

export function useAllDescendantIds(id: EntityId): EntityId[] {
  return useApiClientSelector((state) => selectAllDescendantIds(state, id));
}

export function useRootRecords(): RQAPI.ApiClientRecord[] {
  return useApiClientSelector(selectRootRecords);
}

export function useCollections(): RQAPI.CollectionRecord[] {
  return useApiClientSelector(selectCollections);
}

export function useApiRecordsOnly(): RQAPI.ApiRecord[] {
  return useApiClientSelector(selectApiRecords);
}

export function useTotalRecords(): number {
  return useApiClientSelector(selectTotalRecords);
}

export function useRecordsLoading(): boolean {
  return useApiClientSelector(selectRecordsLoading);
}

export function useRecordsError(): string | null {
  return useApiClientSelector(selectRecordsError);
}

export function useCollectionPath(id: EntityId): RQAPI.ApiClientRecord[] {
  return useApiClientSelector((state) => selectCollectionPath(state, id));
}
