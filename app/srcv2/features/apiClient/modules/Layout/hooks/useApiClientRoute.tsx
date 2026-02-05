import { useMemo } from "react";
import { useSelector } from "react-redux";
import { getActiveWorkspace } from "@adapters/store/workspace";
import { isFeatureCompatible } from "@adapters/utils";
import { ApiClientViewMode, useViewMode } from "@adapters/workspace";
import { WorkspaceType } from "@adapters/workspace";

import { FEATURES } from "../constants";
import type { ApiClientRouteHook } from "../types";

export default function useApiClientRoute(): ApiClientRouteHook {
  const currentViewMode = useViewMode();
  const activeWorkspace = useSelector(getActiveWorkspace);
  const isApiClientCompatible = useMemo(() => {
    const isOlderDesktopVersion = !isFeatureCompatible(FEATURES.LOCAL_WORKSPACE_COMPATIBILITY);
    const requiresLocalWorkspaceFeature =
      currentViewMode === ApiClientViewMode.MULTI || activeWorkspace.workspaceType === WorkspaceType.LOCAL;
    const hasIncompatibleConfiguration = isOlderDesktopVersion && requiresLocalWorkspaceFeature;
    return !hasIncompatibleConfiguration;
  }, [currentViewMode, activeWorkspace.workspaceType]);
  return {
    isApiClientCompatible,
  };
}
