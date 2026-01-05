import { createSlice, createEntityAdapter, PayloadAction } from "@reduxjs/toolkit";
import { mapValues, pickBy } from "lodash";
import { API_CLIENT_ENVIRONMENTS_SLICE_NAME, GLOBAL_ENVIRONMENT_ID } from "../common/constants";
import { EnvironmentEntity, EnvironmentsState } from "./types";
import { PersistConfig } from "redux-deep-persist/lib/types";
import persistReducer from "redux-persist/es/persistReducer";
import createTransform from "redux-persist/es/createTransform";
import storage from "redux-persist/lib/storage";
import { ApiClientVariables } from "../entities/api-client-variables";
import { DeepPartial, EntityId } from "../types";
import { entitySynced } from "../common/actions";
import { ApiClientEntityType } from "../entities/types";

export const environmentsAdapter = createEntityAdapter<EnvironmentEntity>({
  selectId: (env) => env.id,
  sortComparer: (a, b) => a.name.localeCompare(b.name),
});

const initialState: EnvironmentsState = {
  environments: environmentsAdapter.getInitialState(),
  globalEnvironment: {
    id: GLOBAL_ENVIRONMENT_ID,
    name: "Global Environment",
    variables: {},
  },
  activeEnvironmentId: null,
};

export const environmentsSlice = createSlice({
  name: API_CLIENT_ENVIRONMENTS_SLICE_NAME,
  initialState,
  reducers: {
    environmentCreated(state, action: PayloadAction<EnvironmentEntity>) {
      environmentsAdapter.addOne(state.environments, action.payload);

      if (state.environments.ids.length === 1) {
        state.activeEnvironmentId = action.payload.id;
      }
    },

    environmentsCreated(state, action: PayloadAction<EnvironmentEntity[]>) {
      environmentsAdapter.addMany(state.environments, action.payload);
    },

    environmentUpdated(
      state,
      action: PayloadAction<{ id: EntityId; changes: Partial<Omit<EnvironmentEntity, "id" | "variables">> }>
    ) {
      const { id, changes } = action.payload;
      environmentsAdapter.updateOne(state.environments, { id, changes });
    },

    environmentDeleted(state, action: PayloadAction<EntityId>) {
      const id = action.payload;
      environmentsAdapter.removeOne(state.environments, id);

      // Clear active if deleted
      if (state.activeEnvironmentId === id) {
        state.activeEnvironmentId = null;
      }
    },

    setActiveEnvironment(state, action: PayloadAction<EntityId | null>) {
      state.activeEnvironmentId = action.payload;
    },

    unsafePatch(
      state,
      action: PayloadAction<{
        id: EntityId;
        patcher: (env: EnvironmentEntity) => void;
      }>
    ) {
      const entity = state.environments.entities[action.payload.id];
      if (entity) {
        action.payload.patcher(entity);
      }
    },

    unsafePatchGlobal(
      state,
      action: PayloadAction<{
        patcher: (env: EnvironmentEntity) => void;
      }>
    ) {
      if (state.globalEnvironment) {
        action.payload.patcher(state.globalEnvironment);
      }
    },

    hydrate(
      state,
      action: PayloadAction<{
        environments: EnvironmentEntity[];
        globalEnvironment: EnvironmentEntity;
        activeEnvironmentId?: string | null;
      }>
    ) {
      const { environments, globalEnvironment, activeEnvironmentId } = action.payload;
      environmentsAdapter.setAll(state.environments, environments);
      state.globalEnvironment = globalEnvironment;
      if (activeEnvironmentId !== undefined) {
        state.activeEnvironmentId = activeEnvironmentId;
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(entitySynced, (state, action) => {
      const { entityType, entityId, data } = action.payload;
      if (entityType === ApiClientEntityType.ENVIRONMENT) {
        if (data) {
          environmentsAdapter.updateOne(state.environments, {
            id: entityId,
            changes: data,
          });
        }
      } else if (entityType === ApiClientEntityType.GLOBAL_ENVIRONMENT) {
        if (data) {
          state.globalEnvironment = {
            ...state.globalEnvironment,
            ...data,
          };
        }
      }
    });
  },
});

// Persistence transform for environment variables
const hydrationTransformer = createTransform<
  EnvironmentsState["environments"],
  {
    entities: { [key: string]: DeepPartial<EnvironmentEntity> };
  },
  EnvironmentsState
>(
  // Transform state on its way to being serialized and persisted
  (inboundState) => {
    const inboundEntities = pickBy(inboundState.entities, (e) => !!e);
    const entities = mapValues(inboundEntities, (env) => {
      return {
        id: env.id,
        variables: ApiClientVariables.perist(env.variables, {
          isPersisted: true, // always persist environment variables
        }),
      };
    });

    return {
      entities,
    };
  },
  (outboundState) => {
    return {
      ids: [],
      entities: outboundState.entities as EnvironmentsState["environments"]["entities"],
    };
  },
  {
    whitelist: ["environments", "entities"],
  }
);

// Global environment persistence transform
const globalEnvHydrationTransformer = createTransform<
  EnvironmentsState["globalEnvironment"],
  DeepPartial<EnvironmentEntity> | null,
  EnvironmentsState
>(
  (inboundState) => {
    if (!inboundState) {
      return {
        id: GLOBAL_ENVIRONMENT_ID,
        name: "Global Environment",
        variables: {},
      };
    }
    return {
      id: inboundState.id,
      variables: ApiClientVariables.perist(inboundState.variables, {
        isPersisted: true,
      }),
    };
  },
  (outboundState) => {
    return outboundState as EnvironmentsState["globalEnvironment"];
  },
  {
    whitelist: ["globalEnvironment"],
  }
);

export const createEnvironmentsPersistConfig = (
  contextId: string
): PersistConfig<EnvironmentsState, { [key: string]: DeepPartial<EnvironmentEntity> }, unknown, unknown> => ({
  key: `${contextId}:api_client_environments`,
  storage: storage,
  transforms: [hydrationTransformer, globalEnvHydrationTransformer],
  whitelist: ["environments", "globalEnvironment", "activeEnvironmentId"],
});

export const createEnvironmentsPersistedReducer = (contextId: string) =>
  persistReducer(createEnvironmentsPersistConfig(contextId), environmentsSlice.reducer);

export const environmentsActions = environmentsSlice.actions;
export const environmentsReducer = environmentsSlice.reducer;
