import { createSlice, createEntityAdapter, PayloadAction } from "@reduxjs/toolkit";
import { set, unset } from "lodash";
import { RQAPI } from "features/apiClient/types";
import { ErroredRecord } from "features/apiClient/helpers/modules/sync/local/services/types";
import { buildTreeIndices } from "../utils/treeUtils";
import { objectToSetOperations, objectToDeletePaths } from "../utils/pathConverter";
import { EntityId, EntityNotFound, TreeIndices, UpdateCommand } from "../types";
import { ApiRecordsState } from "./types";
import { API_CLIENT_RECORDS_SLICE_NAME } from "../common/constants";

export const apiRecordsAdapter = createEntityAdapter<RQAPI.ApiClientRecord>({
  selectId: (record) => record.id,
  sortComparer: (a, b) => (a.createdTs || 0) - (b.createdTs || 0),
});

const emptyTreeIndices: TreeIndices = {
  childToParent: {},
  parentToChildren: {},
  rootIds: [],
};

const initialState: ApiRecordsState = {
  records: apiRecordsAdapter.getInitialState(),
  tree: emptyTreeIndices,
};

function rebuildTreeIndices(state: ApiRecordsState): void {
  const allRecords = Object.values(state.records.entities).filter(
    (entity): entity is RQAPI.ApiClientRecord => entity != null && "id" in entity && "type" in entity
  );
  state.tree = buildTreeIndices(allRecords);
}

export const apiRecordsSlice = createSlice({
  name: API_CLIENT_RECORDS_SLICE_NAME,
  initialState,
  reducers: {
    setAllRecords(state, action: PayloadAction<RQAPI.ApiClientRecord[]>) {
      apiRecordsAdapter.setAll(state.records, action.payload);
      rebuildTreeIndices(state);
    },

    recordUpserted(state, action: PayloadAction<RQAPI.ApiClientRecord>) {
      apiRecordsAdapter.upsertOne(state.records, action.payload);
      rebuildTreeIndices(state);
    },

    applyPatch(
      state,
      action: PayloadAction<{
        id: EntityId;
        command: UpdateCommand<RQAPI.ApiClientRecord>;
      }>
    ) {
      const { id, command } = action.payload;
      const entity = state.records.entities[id];
      if (entity == null) {
        throw new EntityNotFound(id, "apiClientrecord");
      };

      let shouldRebuildTree = false;

      if (command.type === "SET") {
        const operations = objectToSetOperations(command.value);

        for (const { path, value } of operations) {
          set(entity, [...path], value);

          if (path[0] === "collectionId") {
            shouldRebuildTree = true;
          }
        }
      } else if (command.type === "DELETE") {
        const paths = objectToDeletePaths(command.value);

        for (const path of paths) {
          unset(entity, [...path]);

          if (path[0] === "collectionId") {
            shouldRebuildTree = true;
          }
        }
      }

      if (shouldRebuildTree) {
        rebuildTreeIndices(state);
      }
    },

    unsafePatch(state, action: PayloadAction<{
      id: EntityId,
      patcher: (state: RQAPI.ApiClientRecord) => void,
    }>) {
      const entity = state.records.entities[action.payload.id];
      if (entity == null) {
        throw new EntityNotFound(action.payload.id, "apiClientrecord");
      };

      action.payload.patcher(entity);
    },

    recordDeleted(state, action: PayloadAction<EntityId>) {
      apiRecordsAdapter.removeOne(state.records, action.payload);
      rebuildTreeIndices(state);
    },

    recordsDeleted(state, action: PayloadAction<EntityId[]>) {
      apiRecordsAdapter.removeMany(state.records, action.payload);
      rebuildTreeIndices(state);
    },

    clearAllRecords(state) {
      apiRecordsAdapter.removeAll(state.records);
      state.tree = emptyTreeIndices;
    },

    hydrate(
      state,
      action: PayloadAction<{
        records: RQAPI.ApiClientRecord[];
        erroredRecords: ErroredRecord[];
      }>
    ) {
      apiRecordsAdapter.setAll(state.records, action.payload.records);
      rebuildTreeIndices(state);
    },
  },
});

export const apiRecordsActions = apiRecordsSlice.actions;
export const apiRecordsReducer = apiRecordsSlice.reducer;
