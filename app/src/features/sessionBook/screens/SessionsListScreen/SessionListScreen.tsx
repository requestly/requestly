import ExtensionVersionError from "views/features/sessions/errors/ExtensionVersionError";
import { SessionsList } from "./components/SessionsList/SessionsList";
import { isExtensionInstalled, isExtensionVersionCompatible } from "actions/ExtensionActions";
import { useSelector } from "react-redux";
import APP_CONSTANTS from "config/constants";
import { ContentListScreen } from "componentsV2/ContentList";
import { getActiveWorkspaceId, isPersonalWorkspace } from "features/workspaces/utils";
import { getActiveWorkspaceIds } from "store/slices/workspaces/selectors";

export const SessionsListScreen = () => {
  const activeWorkspaceId = getActiveWorkspaceId(useSelector(getActiveWorkspaceIds));
  const isSharedWorkspaceMode = !isPersonalWorkspace(activeWorkspaceId);

  const isSessionsCompatible = isExtensionVersionCompatible(APP_CONSTANTS.SESSION_RECORDING_COMPATIBILITY_VERSION);
  if (isExtensionInstalled() && !isSessionsCompatible && !isSharedWorkspaceMode) {
    return <ExtensionVersionError />;
  }

  return (
    <ContentListScreen>
      <SessionsList />
    </ContentListScreen>
  );
};
