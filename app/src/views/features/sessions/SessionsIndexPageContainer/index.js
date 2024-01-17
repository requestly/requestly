import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import { isExtensionInstalled, isExtensionVersionCompatible } from "actions/ExtensionActions";
import APP_CONSTANTS from "config/constants";
import { useSelector } from "react-redux";
import { getIsWorkspaceMode } from "store/features/teams/selectors";
import ExtensionVersionError from "../errors/ExtensionVersionError";
import SessionsIndexPage from "./SessionsIndexPage";
import { getAppMode } from "store/selectors";

const SessionsIndexPageContainer = () => {
  const isWorkspaceMode = useSelector(getIsWorkspaceMode);
  const isFeatureCompatible = isExtensionVersionCompatible(APP_CONSTANTS.SESSION_RECORDING_COMPATIBILITY_VERSION);
  const appMode = useSelector(getAppMode);

  if (isExtensionInstalled() && !isFeatureCompatible && !isWorkspaceMode) {
    return <ExtensionVersionError />;
  }


  // todo: change to network index page
  return <SessionsIndexPage desktopMode={appMode=== GLOBAL_CONSTANTS.APP_MODES.DESKTOP}/>;
};

export default SessionsIndexPageContainer;
