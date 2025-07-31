import { useEffect, useState } from "react";
import { useFeatureValue } from "@growthbook/growthbook-react";
import { useSelector } from "react-redux";
import { getAppMode } from "store/selectors";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import FEATURES from "config/constants/sub/features";
import { isFeatureCompatible } from "utils/CompatibilityUtils";
import { getActiveWorkspace } from "store/slices/workspaces/selectors";
import { WorkspaceType } from "features/workspaces/types";
import { getUserOS } from "utils/Misc";

interface Props {
  skipWorkspaceCheck: boolean;
}

export const useCheckLocalSyncSupport = (options: Props = { skipWorkspaceCheck: false }) => {
  const os = getUserOS();
  const localSyncSupportFlag = useFeatureValue("local_sync_support", {
    whitelist: ["macOS", "Linux"],
  });
  const isOsSupported = localSyncSupportFlag?.whitelist?.includes(os);
  const rawIsWorkspaceLocal = useSelector(getActiveWorkspace)?.workspaceType === WorkspaceType.LOCAL;
  const isWorkspaceLocal = options.skipWorkspaceCheck ? true : rawIsWorkspaceLocal;
  const appMode = useSelector(getAppMode);

  const [isLocalSyncSupported, setIsLocalSyncSupported] = useState(false);

  useEffect(() => {
    if (
      isOsSupported &&
      appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP &&
      isFeatureCompatible(FEATURES.LOCAL_FILE_SYNC) &&
      isWorkspaceLocal
    ) {
      setIsLocalSyncSupported(true);
      return;
    }
    setIsLocalSyncSupported(false);
  }, [appMode, isOsSupported, isWorkspaceLocal, options.skipWorkspaceCheck]);

  return isLocalSyncSupported;
};
