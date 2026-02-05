/**
 * Workspace Adapter
 *
 * This module serves as a bridge between srcv2 and src for workspace functionality.
 * It re-exports workspace-related types, hooks, and utilities from the legacy codebase
 * to maintain compatibility while building new features in srcv2.
 */

export * from "features/apiClient/slices/workspaceView";
export * from "features/apiClient/slices/workspaceView/helpers/ApiClientContextRegistry";
export * from "features/apiClient/slices/workspaceView/helpers/ApiClientContextService";
export * from "features/apiClient/slices/workspaceView/slice";
export * from "features/apiClient/slices/workspaceView/thunks";
