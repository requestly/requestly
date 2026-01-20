import FEATURES from "config/constants/sub/features";
import { useSelector } from "react-redux";
import { getAppMode } from "store/selectors";
import { isFeatureCompatible } from "utils/CompatibilityUtils";
import NetworkSessionsIndexPage from "views/features/sessions/SessionsIndexPageContainer/NetworkSessions";
import DesktopAppError from "views/features/sessions/errors/DesktopAppError";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/constants";
import { SessionsListScreen } from "./SessionListScreen";
import "./sessionsListScreenContainer.scss";

export const SessionsListScreenContainer = () => {
  const appMode = useSelector(getAppMode);

  return (
    <div className="sessions-list-screen-container">
      {isFeatureCompatible(FEATURES.NETWORK_SESSIONS) ? (
        <NetworkSessionsIndexPage />
      ) : appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP ? (
        <DesktopAppError />
      ) : (
        <SessionsListScreen />
      )}
    </div>
  );
};
