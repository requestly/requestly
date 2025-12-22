import { createSelector } from "@reduxjs/toolkit";
import { EntityId } from "../types";
import { environmentsAdapter } from "./slice";
import { ApiClientStoreState } from "../workspaceView/helpers/ApiClientContextRegistry";
import { EnvironmentEntity } from "./types";

const selectEnvironmentsSlice = (state: ApiClientStoreState) => state.environments;

const selectEnvironmentsEntityState = createSelector(selectEnvironmentsSlice, (slice) => slice.environments);

const adapterSelectors = environmentsAdapter.getSelectors(selectEnvironmentsEntityState);

// Basic entity adapter selectors
export const selectAllEnvironments = adapterSelectors.selectAll;
export const selectEnvironmentsEntities = adapterSelectors.selectEntities;
export const selectEnvironmentIds = adapterSelectors.selectIds;
export const selectTotalEnvironments = adapterSelectors.selectTotal;
export const selectEnvironmentById = adapterSelectors.selectById;

// Active environment
export const selectActiveEnvironmentId = createSelector(
  selectEnvironmentsSlice,
  (slice) => slice.activeEnvironmentId
);

export const selectActiveEnvironment = createSelector(
  [selectEnvironmentsEntities, selectActiveEnvironmentId],
  (entities, activeId): EnvironmentEntity | null => {
    if (!activeId) return null;
    return entities[activeId] ?? null;
  }
);

// Global environment
export const selectGlobalEnvironment = createSelector(
  selectEnvironmentsSlice,
  (slice) => slice.globalEnvironment
);

// Environment by id (parameterized)
export const selectEnvironmentByIdParam = createSelector(
  [selectEnvironmentsEntities, (_state: ApiClientStoreState, id: EntityId) => id],
  (entities, id) => entities[id] ?? null
);

// Environment variables selectors
export const selectEnvironmentVariables = createSelector(
  [selectEnvironmentsEntities, (_state: ApiClientStoreState, id: EntityId) => id],
  (entities, id) => entities[id]?.variables ?? {}
);

export const selectActiveEnvironmentVariables = createSelector(
  selectActiveEnvironment,
  (activeEnv) => activeEnv?.variables ?? {}
);

export const selectGlobalEnvironmentVariables = createSelector(
  selectGlobalEnvironment,
  (globalEnv) => globalEnv?.variables ?? {}
);

// Check if environment exists
export const selectIsEnvironmentLoaded = createSelector(
  [selectEnvironmentsEntities, (_state: ApiClientStoreState, id: EntityId) => id],
  (entities, id) => id in entities
);

// Memoized selector factories
export const makeSelectEnvironmentById = () =>
  createSelector(
    [selectEnvironmentsEntities, (_state: ApiClientStoreState, id: EntityId) => id],
    (entities, id) => entities[id] ?? null
  );

export const makeSelectEnvironmentVariables = () =>
  createSelector(
    [selectEnvironmentsEntities, (_state: ApiClientStoreState, id: EntityId) => id],
    (entities, id) => entities[id]?.variables ?? {}
  );

