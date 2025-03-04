import { useEffect, useState } from "react";
import { useFeatureValue } from "@growthbook/growthbook-react";
import { useSelector } from "react-redux";
import { getAppMode } from "store/selectors";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import FEATURES from "config/constants/sub/features";
import { isFeatureCompatible } from "utils/CompatibilityUtils";
import { getActiveWorkspaceId, isLocalFSWorkspace } from "features/workspaces/utils";
import { getActiveWorkspaceIds, getWorkspaceById } from "store/slices/workspaces/selectors";

interface Props {
  skipWorkspaceCheck: boolean;
}

export const useCheckLocalSyncSupport = (options: Props = { skipWorkspaceCheck: false }) => {
  const isLocalSyncFlagSupported = useFeatureValue("local_sync", false);

  const activeWorkspace = useSelector(getWorkspaceById(getActiveWorkspaceId(useSelector(getActiveWorkspaceIds))));
  const rawIsWorkspaceLocal: boolean = isLocalFSWorkspace(activeWorkspace);
  const isWorkspaceLocal = options.skipWorkspaceCheck ? true : rawIsWorkspaceLocal;
  const appMode = useSelector(getAppMode);

  const [isLocalSyncSupported, setIsLocalSyncSupported] = useState(false);

  useEffect(() => {
    if (
      isLocalSyncFlagSupported === true &&
      appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP &&
      isFeatureCompatible(FEATURES.LOCAL_FILE_SYNC) &&
      isWorkspaceLocal
    ) {
      setIsLocalSyncSupported(true);
      return;
    }
    setIsLocalSyncSupported(false);
  }, [appMode, isLocalSyncFlagSupported, isWorkspaceLocal, options.skipWorkspaceCheck]);

  return isLocalSyncSupported;
};
