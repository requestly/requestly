import React, { useState, useRef, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useSearchParams, useNavigate, useRoutes } from "react-router-dom";
import { routes } from "routes";
import SpinnerModal from "components/misc/SpinnerModal";
import AuthModal from "components/authentication/AuthModal";
import APP_CONSTANTS from "config/constants";
import { actions } from "store";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
//UTILS
import {
  getActiveModals,
  getAppMode,
  getUserPersonaSurveyDetails,
  getUserAuthDetails,
  getIsWorkspaceOnboardingCompleted,
} from "store/selectors";
import { getRouteFromCurrentPath } from "utils/URLUtils";
import FreeTrialExpiredModal from "../../components/landing/pricing/FreeTrialExpiredModal";
import SyncConsentModal from "../../components/user/SyncConsentModal";
import { trackPageViewEvent } from "modules/analytics/events/misc/pageView";
import { PersonaSurvey } from "components/misc/PersonaSurvey";
import ImportRulesModal from "components/features/rules/ImportRulesModal";
import ConnectedAppsModal from "components/mode-specific/desktop/MySources/Sources/index";
import { useFeatureValue } from "@growthbook/growthbook-react";
import { WorkspaceOnboarding } from "components/features/rules/GettingStarted/WorkspaceOnboarding";
import InstallExtensionModal from "components/misc/InstallExtensionCTA/Modal";
const { PATHS } = APP_CONSTANTS;

const DashboardContent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const appRoutes = useRoutes(routes);
  const [searchParams] = useSearchParams();
  const appOnboardingExp = useFeatureValue("app_onboarding", null);

  //Global state
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const appMode = useSelector(getAppMode);
  const activeModals = useSelector(getActiveModals);
  const userPersona = useSelector(getUserPersonaSurveyDetails);
  const isWorkspaceOnboardingCompleted = useSelector(getIsWorkspaceOnboardingCompleted);
  const [isImportRulesModalActive, setIsImportRulesModalActive] = useState(false);

  const toggleSpinnerModal = () => {
    dispatch(actions.toggleActiveModal({ modalName: "loadingModal" }));
  };
  const toggleAuthModal = () => {
    dispatch(actions.toggleActiveModal({ modalName: "authModal" }));
  };
  const toggleExtensionModal = () => {
    dispatch(actions.toggleActiveModal({ modalName: "extensionModal" }));
  };
  const toggleSyncConsentModal = () => {
    dispatch(actions.toggleActiveModal({ modalName: "syncConsentModal" }));
  };
  const toggleConnectedAppsModal = () => {
    dispatch(actions.toggleActiveModal({ modalName: "connectedAppsModal" }));
  };
  const toggleWorkspaceOnboardingModal = useCallback(() => {
    dispatch(actions.toggleActiveModal({ modalName: "workspaceOnboardingModal" }));
  }, [dispatch]);

  const toggleImportRulesModal = () => {
    setIsImportRulesModalActive(isImportRulesModalActive ? false : true);
  };

  const usePrevious = (value) => {
    const ref = useRef();
    useEffect(() => {
      ref.current = value;
    });
    return ref.current;
  };

  const prevProps = usePrevious({ location });

  useEffect(() => {
    if (PATHS.ROOT === location.pathname && appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP) {
      navigate(PATHS.DESKTOP.INTERCEPT_TRAFFIC.ABSOLUTE);
    }
  }, [appMode, location, navigate]);

  useEffect(() => {
    if (prevProps && prevProps.location !== location) {
      document.documentElement.scrollTop = 0;
      document.scrollingElement.scrollTop = 0;
      document.getElementById("dashboardMainContent").scrollTop = 0;
    }

    // ANALYTICS
    if (!prevProps || prevProps.location !== location) {
      trackPageViewEvent(getRouteFromCurrentPath(location.pathname), Object.fromEntries(searchParams));
    }
  }, [location, prevProps, searchParams]);

  return (
    <>
      <div id="dashboardMainContent">{appRoutes}</div>

      {/* MODALS */}
      {activeModals.loadingModal.isActive ? (
        <SpinnerModal isOpen={activeModals.loadingModal.isActive} toggle={() => toggleSpinnerModal()} />
      ) : null}
      {activeModals.authModal.isActive ? (
        <AuthModal
          isOpen={activeModals.authModal.isActive}
          toggle={() => toggleAuthModal()}
          {...activeModals.authModal.props}
        />
      ) : null}
      {activeModals.extensionModal.isActive ? (
        <InstallExtensionModal
          open={activeModals.extensionModal.isActive}
          onCancel={() => toggleExtensionModal()}
          eventPage="dashboard_content"
          {...activeModals.extensionModal.props}
        />
      ) : null}
      {activeModals.freeTrialExpiredModal.isActive ? (
        <FreeTrialExpiredModal
          isOpen={activeModals.freeTrialExpiredModal.isActive}
          {...activeModals.freeTrialExpiredModal.props}
        />
      ) : null}
      {activeModals.syncConsentModal.isActive ? (
        <SyncConsentModal
          isOpen={activeModals.syncConsentModal.isActive}
          toggle={toggleSyncConsentModal}
          {...activeModals.syncConsentModal.props}
        />
      ) : null}
      {activeModals.connectedAppsModal.isActive ? (
        <ConnectedAppsModal
          isOpen={activeModals.connectedAppsModal.isActive}
          toggle={toggleConnectedAppsModal}
          {...activeModals.connectedAppsModal.props}
        />
      ) : null}
      {!userPersona.isSurveyCompleted && appOnboardingExp === "control" && !user?.loggedIn ? (
        <PersonaSurvey isSurveyModal={true} isOpen={activeModals.personaSurveyModal.isActive} />
      ) : null}

      {appOnboardingExp === "workspace_onboarding" &&
      !isWorkspaceOnboardingCompleted &&
      !userPersona.isSurveyCompleted ? (
        <WorkspaceOnboarding
          isOpen={activeModals.workspaceOnboardingModal.isActive}
          handleUploadRulesModalClick={toggleImportRulesModal}
          toggle={toggleWorkspaceOnboardingModal}
        />
      ) : null}

      {isImportRulesModalActive ? (
        <ImportRulesModal isOpen={isImportRulesModalActive} toggle={toggleImportRulesModal} />
      ) : null}
    </>
  );
};

export default DashboardContent;
