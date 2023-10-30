import React from "react";
import { useSelector } from "react-redux";
import { getAppMode } from "../../../store/selectors";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import SessionsIndexPageContainer from "./SessionsIndexPageContainer";
import NetworkSessionsIndexPage from "./SessionsIndexPageContainer/NetworkSessions";
import { isFeatureCompatible } from "utils/CompatibilityUtils";
import FEATURES from "config/constants/sub/features";
import DesktopAppError from "./errors/DesktopAppError";
import { useFeatureIsOn } from "@growthbook/growthbook-react";

const SessionsHomeView = () => {
  const appMode = useSelector(getAppMode);
  const isImportNetworkSessions = useFeatureIsOn("import_export_sessions");

  if (isFeatureCompatible(FEATURES.NETWORK_SESSIONS) && isImportNetworkSessions) {
    return <NetworkSessionsIndexPage />;
  }

  if (appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP) {
    return <DesktopAppError />;
  }

  return <SessionsIndexPageContainer />;
};

export default SessionsHomeView;
