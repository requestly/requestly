import { useFeatureIsOn } from "@growthbook/growthbook-react";
import FEATURES from "config/constants/sub/features";
import { useSelector } from "react-redux";
import { getAppMode } from "store/selectors";
import { isFeatureCompatible } from "utils/CompatibilityUtils";
import NetworkSessionsIndexPage from "views/features/sessions/SessionsIndexPageContainer/NetworkSessions";
import DesktopAppError from "views/features/sessions/errors/DesktopAppError";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import { SessionsListScreen } from "./SessionListScreen";
import "./sessionsListScreenContainer.scss";

export const SessionsListScreenContainer = () => {
  const appMode = useSelector(getAppMode);
  const isImportNetworkSessions = useFeatureIsOn("import_export_sessions");

  return (
    <div className="sessions-list-screen-container">
      {isFeatureCompatible(FEATURES.NETWORK_SESSIONS) && isImportNetworkSessions ? (
        <NetworkSessionsIndexPage />
      ) : appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP ? (
        <DesktopAppError />
      ) : (
        <SessionsListScreen />
      )}
    </div>
  );
};
