import React, { useMemo, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import { getAppMode } from "../../../store/selectors";
import { getIsWorkspaceMode } from "store/features/teams/selectors";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import SessionsIndexPageContainer from "./SessionsIndexPageContainer";
import { isExtensionInstalled } from "actions/ExtensionActions";
import OnboardingView from "./SessionsIndexPageContainer/SessionsIndexPage/OnboardingView";
import NetworkSessionsIndexPage from "./SessionsIndexPageContainer/NetworkSessions";
import { isFeatureCompatible } from "utils/CompatibilityUtils";
import FEATURES from "config/constants/sub/features";
import DesktopAppError from "./errors/DesktopAppError";
import { useFeatureIsOn } from "@growthbook/growthbook-react";
import { actions } from "store";

const SessionsHomeView = () => {
  const isImportNetworkSessions = useFeatureIsOn("import_export_sessions");
  const location = useLocation();
  const dispatch = useDispatch();
  const refParam = useMemo(() => new URLSearchParams(location.search).get("ref"), [location.search]);

  //Global State
  const appMode = useSelector(getAppMode);
  const isWorkspaceMode = useSelector(getIsWorkspaceMode);

  useEffect(() => {
    if (refParam === "producthunt") {
      dispatch(
        actions.toggleActiveModal({
          modalName: "authModal",
          newValue: true,
        })
      );
    }
  }, [dispatch, refParam]);

  if (isFeatureCompatible(FEATURES.NETWORK_SESSIONS) && isImportNetworkSessions) {
    return <NetworkSessionsIndexPage />;
  }

  if (appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP) {
    return <DesktopAppError />;
  }

  return isExtensionInstalled() || isWorkspaceMode ? <SessionsIndexPageContainer /> : <OnboardingView />;
};

export default SessionsHomeView;
