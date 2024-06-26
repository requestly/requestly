import ExtensionVersionError from "views/features/sessions/errors/ExtensionVersionError";
import { SessionsList } from "./components/SessionsList/SesssionsList";
import { isExtensionInstalled, isExtensionVersionCompatible } from "actions/ExtensionActions";
import { useSelector } from "react-redux";
import APP_CONSTANTS from "config/constants";
import { getIsWorkspaceMode } from "store/features/teams/selectors";

export const SessionsListScreen = () => {
  const isWorkspaceMode = useSelector(getIsWorkspaceMode);
  const isSessionsCompatible = isExtensionVersionCompatible(APP_CONSTANTS.SESSION_RECORDING_COMPATIBILITY_VERSION);
  if (isExtensionInstalled() && !isSessionsCompatible && !isWorkspaceMode) {
    return <ExtensionVersionError />;
  }

  return <SessionsList />;
};
