import { isExtensionInstalled, isExtensionVersionCompatible } from "actions/ExtensionActions";
import APP_CONSTANTS from "config/constants";
import { useSelector } from "react-redux";
import { getIsWorkspaceMode } from "store/features/teams/selectors";
import ExtensionVersionError from "../errors/ExtensionVersionError";
import SessionsIndexPage from "./SessionsIndexPage";
import { useFeatureIsOn } from "@growthbook/growthbook-react";
import FEATURES from "config/constants/sub/features";
import { isFeatureCompatible } from "utils/CompatibilityUtils";

const SessionsIndexPageContainer = () => {
  const isWorkspaceMode = useSelector(getIsWorkspaceMode);
  const isSessionsCompatible = isExtensionVersionCompatible(APP_CONSTANTS.SESSION_RECORDING_COMPATIBILITY_VERSION);
  const isDesktopSessionsCompatible =
    useFeatureIsOn("desktop-sessions") && isFeatureCompatible(FEATURES.DESKTOP_SESSIONS);
  if (isExtensionInstalled() && !isSessionsCompatible && !isWorkspaceMode) {
    return <ExtensionVersionError />;
  }

  return <SessionsIndexPage desktopMode={isDesktopSessionsCompatible} />;
};

export default SessionsIndexPageContainer;
