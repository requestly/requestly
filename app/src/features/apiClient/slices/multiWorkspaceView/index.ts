export * from "./types";

export {
  multiWorkspaceViewSlice,
  multiWorkspaceViewActions,
  multiWorkspaceViewReducer,
  multiWorkspaceViewAdapter,
} from "./multiWorkspaceViewSlice";

export {
  getViewMode,
  getSelectedWorkspaceIds,
  getAllSelectedWorkspaces,
  getSelectedWorkspacesEntities,
  getSelectedWorkspaceCount,
  getWorkspaceById,
  getIsSelected,
  getIsAllWorkspacesLoaded,
} from "./selectors";

export { addWorkspaceToView, removeWorkspaceFromView, resetToSingleView, loadWorkspaces } from "./thunks";

export { useMultiWorkspaceView } from "./hooks";
