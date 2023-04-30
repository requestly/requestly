import React from "react";
import { getAppMode } from "../../../store/selectors";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import SessionsIndexPageContainer from "./SessionsIndexPageContainer";
import { isExtensionInstalled } from "actions/ExtensionActions";
import OnboardingView from "./SessionsIndexPageContainer/SessionsIndexPage/OnboardingView";
import { useSelector } from "react-redux";
import { getIsWorkspaceMode } from "store/features/teams/selectors";
import NetworkSessionsIndexPage from "./SessionsIndexPageContainer/NetworkSessions";

const SessionsHomeView = () => {
  //Global State
  const appMode = useSelector(getAppMode);
  const isWorkspaceMode = useSelector(getIsWorkspaceMode);
  if (appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP) {
    return <NetworkSessionsIndexPage />;
    // return <OnboardingView type={OnboardingTypes.NETWORK} />;
  }

  return isExtensionInstalled() || isWorkspaceMode ? <SessionsIndexPageContainer /> : <OnboardingView />;
};

export default SessionsHomeView;
