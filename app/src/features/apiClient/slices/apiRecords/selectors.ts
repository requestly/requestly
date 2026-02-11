import { createSelector } from "@reduxjs/toolkit";
import { RQAPI } from "features/apiClient/types";
import { getParentChain, getAllDescendants, getImmediateChildren } from "../utils/treeUtils";
import { EntityId } from "../types";
import { apiRecordsAdapter } from "./slice";
import { ApiClientStoreState } from "../workspaceView/helpers/ApiClientContextRegistry";

const selectRecordsSlice = (state: ApiClientStoreState) => state.records;

const selectRecordsEntityState = createSelector(selectRecordsSlice, (slice) => slice.records);

const adapterSelectors = apiRecordsAdapter.getSelectors(selectRecordsEntityState);

export const selectAllRecords = adapterSelectors.selectAll;
export const selectRecordsEntities = adapterSelectors.selectEntities;
export const selectRecordIds = adapterSelectors.selectIds;
export const selectTotalRecords = adapterSelectors.selectTotal;
export const selectRecordById = adapterSelectors.selectById;

export const selectTreeIndices = createSelector(selectRecordsSlice, (slice) => slice.tree);

export const selectChildToParent = createSelector(selectTreeIndices, (tree) => tree.childToParent);

export const selectParentToChildren = createSelector(selectTreeIndices, (tree) => tree.parentToChildren);

export const selectRootIds = createSelector(selectTreeIndices, (tree) => tree.rootIds);

export const selectRootRecords = createSelector([selectRootIds, selectRecordsEntities], (rootIds, entities) =>
  rootIds.map((id) => entities[id]).filter((r): r is RQAPI.ApiClientRecord => r != null)
);

export const selectParentId = createSelector(
  [selectChildToParent, (_state: ApiClientStoreState, id: EntityId) => id],
  (childToParent, id) => childToParent[id] ?? null
);

export const selectAncestorIds = createSelector(
  [selectChildToParent, (_state: ApiClientStoreState, id: EntityId) => id],
  (childToParent, id) => getParentChain(id, childToParent)
);

export const selectAncestorRecords = createSelector(
  [selectRecordsEntities, selectChildToParent, (_state: ApiClientStoreState, id: EntityId) => id],
  (entities, childToParent, id) => {
    const ancestorIds = getParentChain(id, childToParent);
    return ancestorIds.map((ancestorId) => entities[ancestorId]).filter((r): r is RQAPI.ApiClientRecord => r != null);
  }
);

export const selectChildrenIds = createSelector(
  [selectParentToChildren, (_state: ApiClientStoreState, id: EntityId) => id],
  (parentToChildren, id) => getImmediateChildren(id, parentToChildren)
);

export const selectChildRecords = createSelector(
  [selectRecordsEntities, selectParentToChildren, (_state: ApiClientStoreState, id: EntityId) => id],
  (entities, parentToChildren, id) => {
    const childIds = getImmediateChildren(id, parentToChildren);
    return childIds.map((childId) => entities[childId]).filter((r): r is RQAPI.ApiClientRecord => r != null);
  }
);

export const selectAllDescendantIds = createSelector(
  [selectParentToChildren, (_state: ApiClientStoreState, id: EntityId) => id],
  (parentToChildren, id) => getAllDescendants(id, parentToChildren)
);

export const selectAllDescendantApiRecordIds = createSelector(
  [selectRecordsEntities, selectParentToChildren, (_state: ApiClientStoreState, id: EntityId) => id],
  (entities, parentToChildren, id) => {
    const descendantIds = getAllDescendants(id, parentToChildren);
    return descendantIds.filter((descId) => {
      const record = entities[descId];
      return record?.type === RQAPI.RecordType.API;
    });
  }
);

export const selectAllDescendantRecords = createSelector(
  [selectRecordsEntities, selectParentToChildren, (_state: ApiClientStoreState, id: EntityId) => id],
  (entities, parentToChildren, id) => {
    const descendantIds = getAllDescendants(id, parentToChildren);
    return descendantIds.map((descId) => entities[descId]).filter((r): r is RQAPI.ApiClientRecord => r != null);
  }
);

export const selectCollections = createSelector(selectAllRecords, (records) =>
  records.filter((r): r is RQAPI.CollectionRecord => r.type === RQAPI.RecordType.COLLECTION)
);

export const selectApiRecords = createSelector(selectAllRecords, (records) =>
  records.filter((r): r is RQAPI.ApiRecord => r.type === RQAPI.RecordType.API)
);

export const selectRecordsByCollectionId = createSelector(
  [selectAllRecords, (_state: ApiClientStoreState, collectionId: EntityId | null) => collectionId],
  (records, collectionId) => records.filter((r) => r.collectionId === collectionId)
);

export const selectRecordsByType = createSelector(
  [selectAllRecords, (_state: ApiClientStoreState, type: RQAPI.RecordType) => type],
  (records, type) => records.filter((r) => r.type === type)
);

export const selectIsRecordLoaded = createSelector(
  [selectRecordsEntities, (_state: ApiClientStoreState, id: EntityId) => id],
  (entities, id) => id in entities
);

export const selectRecordWithAncestors = createSelector(
  [selectRecordsEntities, selectChildToParent, (_state: ApiClientStoreState, id: EntityId) => id],
  (entities, childToParent, id) => {
    const record = entities[id];
    if (!record) return null;

    const ancestorIds = getParentChain(id, childToParent);
    const ancestors = ancestorIds
      .map((ancestorId) => entities[ancestorId])
      .filter((r): r is RQAPI.ApiClientRecord => r != null);

    return { record, ancestors };
  }
);

export const selectCollectionPath = createSelector(
  [selectRecordsEntities, selectChildToParent, (_state: ApiClientStoreState, id: EntityId) => id],
  (entities, childToParent, id) => {
    const record = entities[id];
    if (!record) return [];

    const ancestorIds = getParentChain(id, childToParent);
    const path = [
      record,
      ...ancestorIds.map((aid) => entities[aid]).filter((r): r is RQAPI.ApiClientRecord => r != null),
    ];
    return path.reverse();
  }
);

export const makeSelectRecordById = () =>
  createSelector(
    [selectRecordsEntities, (_state: ApiClientStoreState, id: EntityId) => id],
    (entities, id) => entities[id] ?? null
  );

export const makeSelectChildrenIds = () =>
  createSelector([selectParentToChildren, (_state: ApiClientStoreState, id: EntityId) => id], (parentToChildren, id) =>
    getImmediateChildren(id, parentToChildren)
  );

export const makeSelectAncestorIds = () =>
  createSelector([selectChildToParent, (_state: ApiClientStoreState, id: EntityId) => id], (childToParent, id) =>
    getParentChain(id, childToParent)
  );
