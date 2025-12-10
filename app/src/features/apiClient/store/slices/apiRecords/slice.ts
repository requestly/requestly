import { createSlice, createEntityAdapter, PayloadAction } from "@reduxjs/toolkit";
import { cloneDeep, mergeWith, unset, isPlainObject } from "lodash";
import { RQAPI } from "features/apiClient/types";
import { buildTreeIndices } from "../../utils/treeUtils";
import { EntityId, TreeIndices, UpdateCommand } from "../types";
import { ApiRecordsState } from "./types";

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
  loading: false,
  error: null,
};

function rebuildTreeIndices(state: ApiRecordsState) {
  const allRecords = Object.values(state.records.entities).filter(Boolean) as RQAPI.ApiClientRecord[];
  state.tree = buildTreeIndices(allRecords);
}

function mergeWithNullHandling(
  target: Record<string, unknown>,
  source: Record<string, unknown>
): Record<string, unknown> {
  return mergeWith(cloneDeep(target), source, (objValue, srcValue, key, object) => {
    if (srcValue === null) {
      unset(object, key);
      return undefined;
    }
    if (Array.isArray(srcValue)) {
      return srcValue;
    }
    if (isPlainObject(srcValue) && isPlainObject(objValue)) {
      return mergeWithNullHandling(objValue as Record<string, unknown>, srcValue as Record<string, unknown>);
    }
    return undefined;
  });
}

function applyDelete(target: Record<string, unknown>, deleteMarker: Record<string, unknown>): void {
  for (const key in deleteMarker) {
    const markerValue = deleteMarker[key];
    if (markerValue === true) {
      delete target[key];
    } else if (isPlainObject(markerValue) && isPlainObject(target[key])) {
      applyDelete(target[key] as Record<string, unknown>, markerValue as Record<string, unknown>);
    }
  }
}

export const apiRecordsSlice = createSlice({
  name: "apiClient/records",
  initialState,
  reducers: {
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },

    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },

    setAllRecords(state, action: PayloadAction<RQAPI.ApiClientRecord[]>) {
      apiRecordsAdapter.setAll(state.records, action.payload);
      rebuildTreeIndices(state);
    },

    recordUpserted(state, action: PayloadAction<RQAPI.ApiClientRecord>) {
      apiRecordsAdapter.upsertOne(state.records, action.payload);
      rebuildTreeIndices(state);
    },

    executeCommand(state, action: PayloadAction<{ id: EntityId; command: UpdateCommand<RQAPI.ApiClientRecord> }>) {
      const { id, command } = action.payload;
      const entity = state.records.entities[id];
      if (!entity) return;

      if (command.type === "SET") {
        const merged = mergeWithNullHandling(
          entity as Record<string, unknown>,
          command.value as Record<string, unknown>
        );
        state.records.entities[id] = (merged as unknown) as RQAPI.ApiClientRecord;

        if ("collectionId" in (command.value as Record<string, unknown>)) {
          rebuildTreeIndices(state);
        }
      } else if (command.type === "DELETE") {
        applyDelete((entity as unknown) as Record<string, unknown>, command.value as Record<string, unknown>);

        if ("collectionId" in (command.value as Record<string, unknown>)) {
          rebuildTreeIndices(state);
        }
      }
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
  },
});

export const apiRecordsActions = apiRecordsSlice.actions;
export const apiRecordsReducer = apiRecordsSlice.reducer;
