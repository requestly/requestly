import { WorkspaceType } from "features/workspaces/types";
import { ApiClientViewMode } from "features/apiClient/slices/workspaceView/types";
import { useGetAllSelectedWorkspaces, useViewMode } from "features/apiClient/slices/workspaceView/hooks";

export type MigrationSegment = "local-storage" | "auto-cloud" | "auto-local-fs" | "unknown";

interface ComputeInputs {
  workspaceType: WorkspaceType | undefined;
  viewMode: ApiClientViewMode;
}

export function computeMigrationSegment({ workspaceType, viewMode }: ComputeInputs): MigrationSegment {
  if (viewMode === ApiClientViewMode.MULTI) {
    return "auto-local-fs";
  }
  if (workspaceType === undefined) {
    return "unknown";
  }
  switch (workspaceType) {
    case WorkspaceType.LOCAL:
      return "auto-local-fs";
    case WorkspaceType.LOCAL_STORAGE:
      return "local-storage";
    case WorkspaceType.PERSONAL:
    case WorkspaceType.SHARED:
      return "auto-cloud";
    default:
      return "local-storage";
  }
}

export function useMigrationSegment(): MigrationSegment {
  const selectedWorkspaces = useGetAllSelectedWorkspaces();
  const viewMode = useViewMode();
  // Read workspaceType from the API-Client-scoped workspace slice rather than
  // the global Redux active workspace selector. The latter falls back to a
  // PERSONAL stub when there's no activeWorkspaceId (e.g., signed-out users),
  // which would mis-label a logged-out LOCAL_STORAGE session as auto-cloud.
  return computeMigrationSegment({
    workspaceType: selectedWorkspaces[0]?.meta?.type,
    viewMode,
  });
}
