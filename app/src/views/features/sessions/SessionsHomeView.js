import React from "react";
import { getAppMode } from "../../../store/selectors";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import SessionsIndexPageContainer from "./SessionsIndexPageContainer";
import { isExtensionInstalled } from "actions/ExtensionActions";
import OnboardingView from "./SessionsIndexPageContainer/SessionsIndexPage/OnboardingView";
import { useSelector } from "react-redux";
import { getIsWorkspaceMode } from "store/features/teams/selectors";
import NetworkSessionsIndexPage from "./SessionsIndexPageContainer/NetworkSessions";
import { isFeatureCompatible } from "utils/CompatibilityUtils";
import FEATURES from "config/constants/sub/features";
import DesktopAppError from "./errors/DesktopAppError";
import { useFeatureIsOn } from "@growthbook/growthbook-react";

const SessionsHomeView = () => {
  const isImportNetworkSessions = useFeatureIsOn("import_export_sessions");

  //Global State
  const appMode = useSelector(getAppMode);
  const isWorkspaceMode = useSelector(getIsWorkspaceMode);
  if (isFeatureCompatible(FEATURES.NETWORK_SESSIONS) && isImportNetworkSessions) {
    return <NetworkSessionsIndexPage />;
  }

  if (appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP) {
    return <DesktopAppError />;
  }

  return isExtensionInstalled() || isWorkspaceMode ? <SessionsIndexPageContainer /> : <OnboardingView />;
};

export default SessionsHomeView;

// import React from "react";
// // import { getAppMode } from "../../../store/selectors";
// // import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
// import SessionsIndexPageContainer from "./SessionsIndexPageContainer";
// import { isExtensionInstalled } from "actions/ExtensionActions";
// import OnboardingView from "./SessionsIndexPageContainer/SessionsIndexPage/OnboardingView";
// import { useSelector } from "react-redux";
// import { getIsWorkspaceMode } from "store/features/teams/selectors";
// // import NetworkSessionsIndexPage from "./SessionsIndexPageContainer/NetworkSessions";
// // import { isFeatureCompatible } from "utils/CompatibilityUtils";
// // import FEATURES from "config/constants/sub/features";
// // import DesktopAppError from "./errors/DesktopAppError";
// // import { useFeatureIsOn } from "@growthbook/growthbook-react";

// const SessionsHomeView = () => {
//   // const isImportNetworkSessions = useFeatureIsOn("import_export_sessions");

//   //Global State
//   // const appMode = useSelector(getAppMode);
//   const isWorkspaceMode = useSelector(getIsWorkspaceMode);
//   // if (isFeatureCompatible(FEATURES.NETWORK_SESSIONS) && isImportNetworkSessions) {
//   //   return <NetworkSessionsIndexPage />;
//   // }

//   // if (appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP) {
//   //   return <DesktopAppError />;
//   // }

//   return isExtensionInstalled() || isWorkspaceMode ? <SessionsIndexPageContainer /> : <OnboardingView />;
// };

// export default SessionsHomeView;
