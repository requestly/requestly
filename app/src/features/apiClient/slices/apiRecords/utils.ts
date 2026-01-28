import { Workspace } from "features/workspaces/types";
import { EntityId } from "../types";
import { getApiClientFeatureContext } from "../workspaceView/helpers/ApiClientContextRegistry";
import { selectAncestorIds, selectChildToParent, selectRecordById, selectAllDescendantApiRecordIds } from "./selectors";

export function getAncestorIds(id: EntityId, workspaceId: Workspace["id"]): EntityId[] {
  const { store } = getApiClientFeatureContext(workspaceId);
  const state = store.getState();
  return selectAncestorIds(state, id);
}

export function getRecord(id: EntityId, workspaceId: Workspace["id"]) {
  const { store } = getApiClientFeatureContext(workspaceId);
  const state = store.getState();
  return selectRecordById(state, id);
}

export function getChildToParentMap(workspaceId: Workspace["id"]) {
  const { store } = getApiClientFeatureContext(workspaceId);
  const state = store.getState();
  return selectChildToParent(state);
}

export function getAllDescendantApiRecordIds(id: EntityId, workspaceId: Workspace["id"] | undefined): EntityId[] {
  const { store } = getApiClientFeatureContext(workspaceId);
  const state = store.getState();
  return selectAllDescendantApiRecordIds(state, id);
}
