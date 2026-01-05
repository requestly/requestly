import { createSlice, createEntityAdapter, PayloadAction } from "@reduxjs/toolkit";
import { set, unset, mapValues, pickBy } from "lodash";
import { RQAPI } from "features/apiClient/types";
import { ErroredRecord } from "features/apiClient/helpers/modules/sync/local/services/types";
import { buildTreeIndices } from "../utils/treeUtils";
import { objectToSetOperations, objectToDeletePaths } from "../utils/pathConverter";
import { DeepPartial, EntityId, EntityNotFound, TreeIndices, UpdateCommand } from "../types";
import { ApiRecordsState } from "./types";
import { entitySynced, EntitySyncedPayload } from "../common/actions";
import { API_CLIENT_RECORDS_SLICE_NAME } from "../common/constants";
import { ApiClientEntityType } from "../entities/types";
import { PersistConfig } from "redux-deep-persist/lib/types";
import persistReducer from "redux-persist/es/persistReducer";
import createTransform from "redux-persist/es/createTransform";
import storage from "redux-persist/lib/storage";
import { ApiClientVariables } from "../entities/api-client-variables";

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

    upsertRecord(state, action: PayloadAction<RQAPI.ApiClientRecord>) {
      apiRecordsAdapter.upsertOne(state.records, action.payload);
      rebuildTreeIndices(state);
    },

    upsertRecords(state, action: PayloadAction<RQAPI.ApiClientRecord[]>) {
      apiRecordsAdapter.upsertMany(state.records, action.payload);
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
      }

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

    unsafePatch(
      state,
      action: PayloadAction<{
        id: EntityId;
        patcher: (state: RQAPI.ApiClientRecord) => void;
      }>
    ) {
      const entity = state.records.entities[action.payload.id];
      if (entity == null) {
        throw new EntityNotFound(action.payload.id, "apiClientrecord");
      }

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
  extraReducers: (builder) => {
    builder.addCase(entitySynced, (state, action) => {
      const { entityType, entityId, data: changes } = action.payload as EntitySyncedPayload<RQAPI.ApiClientRecord>;

      const recordEntityTypes = [
        ApiClientEntityType.HTTP_RECORD,
        ApiClientEntityType.COLLECTION_RECORD,
        ApiClientEntityType.GRAPHQL_RECORD,
      ];

      if (!recordEntityTypes.includes(entityType)) {
        return;
      }

      apiRecordsAdapter.updateOne(state.records, {
        id: entityId,
        changes,
      });
      rebuildTreeIndices(state);
    });
  },
});

const hydrationTransformer = createTransform<
  ApiRecordsState["records"],
  {
    entities: { [key: string]: DeepPartial<RQAPI.ApiClientRecord> };
  },
  ApiRecordsState
>(
  (i) => {
    const collections = pickBy(i.entities, (e) => e?.type === RQAPI.RecordType.COLLECTION);
    const entities = mapValues(collections, (c) => {
      const data: DeepPartial<RQAPI.CollectionRecord> = {
        id: c.id,
        data: {
          variables: ApiClientVariables.perist(c.data.variables, {
            isPersisted: true, // always persist collection variables
          }),
        },
      };

      return data;
    });

    return {
      entities,
    };
  },
  (o) => {
    // We have to case here since redux-persist doesn't know that we are handling hydration ourselves
    return { ids: [], entities: o.entities as ApiRecordsState["records"]["entities"] };
  },
  {
    whitelist: ["records", "entities"],
  }
);
export const createApiClientRecordsPersistConfig: (
  contextId: string
) => PersistConfig<ApiRecordsState, { [key: string]: DeepPartial<RQAPI.ApiClientRecord> }, any, any> = (contextId) => ({
  key: `${contextId}:api_client_records`,
  storage: storage,
  transforms: [hydrationTransformer],
  whitelist: ["records", "entities"],
});

export const createApiClientRecordsPersistedReducer = (contextId: string) =>
  persistReducer(createApiClientRecordsPersistConfig(contextId), apiRecordsSlice.reducer);

export const apiRecordsActions = apiRecordsSlice.actions;
export const apiRecordsReducer = apiRecordsSlice.reducer;
