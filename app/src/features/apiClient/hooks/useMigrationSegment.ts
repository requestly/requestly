import { useSelector } from "react-redux";
import { getActiveWorkspace } from "store/slices/workspaces/selectors";
import { WorkspaceType } from "features/workspaces/types";
import { ApiClientViewMode } from "features/apiClient/slices/workspaceView/types";
import { useViewMode } from "features/apiClient/slices/workspaceView/hooks";

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
  const activeWorkspace = useSelector(getActiveWorkspace);
  const viewMode = useViewMode();
  return computeMigrationSegment({
    workspaceType: activeWorkspace?.workspaceType,
    viewMode,
  });
}
