import FEATURES from "config/constants/sub/features";
import { useMemo } from "react";
import { useFeatureIsOn } from "@growthbook/growthbook-react";
import { isFeatureCompatible } from "utils/CompatibilityUtils";
import { getActiveWorkspace } from "store/slices/workspaces/selectors";
import { useSelector } from "react-redux";
import { WorkspaceType } from "features/workspaces/types";
import { WindowsAndLinuxGatedHoc } from "componentsV2/WindowsAndLinuxGatedHoc";
import MandatoryUpdateScreen from "components/mode-specific/desktop/UpdateDialog/MandatoryUpdateScreen";
import ApiClientFeatureContainer from "../container";
import ApiClientErrorBoundary from "./ErrorBoundary/ErrorBoundary";
import { ApiClientViewMode, useViewMode } from "../slices";
import { useMigrationSegment } from "../hooks/useMigrationSegment";
import { MigrationBlockModal } from "../screens/migrationBlock";
import { MIGRATION_BLOCK_FLAG, MIGRATION_BLOCK_DISMISSABLE_FLAG } from "../screens/migrationBlock/constants";

export const ApiClientRouteElement = () => {
  const currentViewMode = useViewMode();
  const activeWorkspace = useSelector(getActiveWorkspace);
  const isApiClientCompatible = useMemo(() => {
    const isOlderDesktopVersion = !isFeatureCompatible(FEATURES.LOCAL_WORKSPACE_COMPATIBILITY);
    const requiresLocalWorkspaceFeature =
      currentViewMode === ApiClientViewMode.MULTI || activeWorkspace?.workspaceType === WorkspaceType.LOCAL;
    const hasIncompatibleConfiguration = isOlderDesktopVersion && requiresLocalWorkspaceFeature;
    return !hasIncompatibleConfiguration;
  }, [currentViewMode, activeWorkspace?.workspaceType]);

  const isBlockFlagOn = useFeatureIsOn(MIGRATION_BLOCK_FLAG);
  const isDismissableFlagOn = useFeatureIsOn(MIGRATION_BLOCK_DISMISSABLE_FLAG);
  const segment = useMigrationSegment();
  const shouldShowBlock = isBlockFlagOn && segment === "local-storage";

  return (
    <WindowsAndLinuxGatedHoc featureName="API client">
      {isApiClientCompatible ? (
        <>
          <ApiClientErrorBoundary boundaryId="api-client-error-boundary">
            <ApiClientFeatureContainer />
          </ApiClientErrorBoundary>
          {shouldShowBlock && <MigrationBlockModal dismissable={isDismissableFlagOn} />}
        </>
      ) : (
        <MandatoryUpdateScreen
          title="Update Required for API Client"
          description="The API Client feature requires a newer version to work with local workspaces. Please update Requestly to access this functionality."
          ctaText="Update Requestly"
          handleCTAClick={() => {
            if (window.RQ?.DESKTOP?.SERVICES?.IPC) {
              window.RQ.DESKTOP.SERVICES.IPC.invokeEventInBG("open-external-link", {
                link: "https://requestly.com/desktop",
              });
            } else {
              console.error("This screen should not be accessed without the desktop environment");
            }
          }}
          independentComponent={true}
        />
      )}
    </WindowsAndLinuxGatedHoc>
  );
};
