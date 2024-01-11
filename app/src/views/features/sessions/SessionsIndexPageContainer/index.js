import { isExtensionInstalled, isExtensionVersionCompatible } from "actions/ExtensionActions";
import APP_CONSTANTS from "config/constants";
import { useSelector } from "react-redux";
import { getIsWorkspaceMode } from "store/features/teams/selectors";
import ExtensionVersionError from "../errors/ExtensionVersionError";
import SessionsIndexPage from "./SessionsIndexPage";

const SessionsIndexPageContainer = () => {
  const isWorkspaceMode = useSelector(getIsWorkspaceMode);
  const isFeatureCompatible = isExtensionVersionCompatible(APP_CONSTANTS.SESSION_RECORDING_COMPATIBILITY_VERSION);

  if (isExtensionInstalled() && !isFeatureCompatible && !isWorkspaceMode) {
    return <ExtensionVersionError />;
  }

  // todo: change to network index page
  return <SessionsIndexPage />;
};

export default SessionsIndexPageContainer;
