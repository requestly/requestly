import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useSearchParams, Outlet } from "react-router-dom";
import SpinnerModal from "components/misc/SpinnerModal";
import AuthModal from "components/authentication/AuthModal";
import { actions } from "store";
//UTILS
import {
  getActiveModals,
  getUserPersonaSurveyDetails,
  getUserAuthDetails,
  getAppMode,
  getIsWorkspaceOnboardingCompleted,
  getIsJoinWorkspaceCardVisible,
} from "store/selectors";
import { getRouteFromCurrentPath } from "utils/URLUtils";
import FreeTrialExpiredModal from "../../components/landing/pricing/FreeTrialExpiredModal";
import SyncConsentModal from "../../components/user/SyncConsentModal";
import { trackPageViewEvent } from "modules/analytics/events/misc/pageView";
import { PersonaSurvey } from "components/misc/PersonaSurvey";
import ImportRulesModal from "components/features/rules/ImportRulesModal";
import ConnectedAppsModal from "components/mode-specific/desktop/MySources/Sources/index";
import { WorkspaceOnboarding } from "components/features/rules/GettingStarted/WorkspaceOnboarding";
import InstallExtensionModal from "components/misc/InstallExtensionCTA/Modal";
import CreateWorkspaceModal from "components/user/AccountIndexPage/ManageAccount/ManageTeams/CreateWorkspaceModal";
import AddMemberModal from "components/user/AccountIndexPage/ManageAccount/ManageTeams/TeamViewer/MembersDetails/AddMemberModal";
import SwitchWorkspaceModal from "components/user/AccountIndexPage/ManageAccount/ManageTeams/SwitchWorkspaceModal/SwitchWorkspaceModal";
import { usePrevious } from "hooks";
import JoinWorkspaceModal from "components/user/AccountIndexPage/ManageAccount/ManageTeams/JoinWorkspaceModal";
import { JoinWorkspaceCard } from "components/misc/JoinWorkspaceCard";
import { isAppOpenedInIframe } from "utils/AppUtils";
import { SharingModal } from "components/common/SharingModal";
import MailLoginLinkPopup from "components/authentication/AuthForm/MagicAuthLinkModal";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import { isPricingPage } from "utils/PathUtils";

const DashboardContent = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  //Global state
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const appMode = useSelector(getAppMode);
  const activeModals = useSelector(getActiveModals);
  const userPersona = useSelector(getUserPersonaSurveyDetails);
  const isWorkspaceOnboardingCompleted = useSelector(getIsWorkspaceOnboardingCompleted);
  const isJoinWorkspaceCardVisible = useSelector(getIsJoinWorkspaceCardVisible);
  const [isImportRulesModalActive, setIsImportRulesModalActive] = useState(false);
  const isInsideIframe = useMemo(isAppOpenedInIframe, []);

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

  const prevProps = usePrevious({ location });

  const disableOverflow = isPricingPage();

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
      <div id="dashboardMainContent" style={{ overflow: !disableOverflow && "auto !important" }}>
        {/* Outlet renders all the children of the root route */}
        <Outlet />
      </div>

      {isInsideIframe ? null : (
        <>
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
          {!userPersona.isSurveyCompleted && !user?.loggedIn && appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP ? (
            <PersonaSurvey isSurveyModal={true} isOpen={activeModals.personaSurveyModal.isActive} />
          ) : null}
          {!isWorkspaceOnboardingCompleted && appMode !== GLOBAL_CONSTANTS.APP_MODES.DESKTOP ? (
            <WorkspaceOnboarding
              isOpen={activeModals.workspaceOnboardingModal.isActive}
              handleUploadRulesModalClick={toggleImportRulesModal}
              toggle={toggleWorkspaceOnboardingModal}
            />
          ) : null}
          {activeModals.createWorkspaceModal.isActive ? (
            <CreateWorkspaceModal
              isOpen={activeModals.createWorkspaceModal.isActive}
              toggleModal={() => dispatch(actions.toggleActiveModal({ modalName: "createWorkspaceModal" }))}
              {...activeModals.createWorkspaceModal.props}
            />
          ) : null}
          {activeModals.inviteMembersModal.isActive ? (
            <AddMemberModal
              isOpen={activeModals.inviteMembersModal.isActive}
              toggleModal={() => dispatch(actions.toggleActiveModal({ modalName: "inviteMembersModal" }))}
              {...activeModals.inviteMembersModal.props}
            />
          ) : null}
          {activeModals.switchWorkspaceModal.isActive ? (
            <SwitchWorkspaceModal
              isOpen={activeModals.switchWorkspaceModal.isActive}
              toggleModal={() => dispatch(actions.toggleActiveModal({ modalName: "switchWorkspaceModal" }))}
              {...activeModals.switchWorkspaceModal.props}
            />
          ) : null}
          {activeModals.joinWorkspaceModal.isActive ? (
            <JoinWorkspaceModal
              isOpen={activeModals.joinWorkspaceModal.isActive}
              toggleModal={() => dispatch(actions.toggleActiveModal({ modalName: "joinWorkspaceModal" }))}
              {...activeModals.joinWorkspaceModal.props}
            />
          ) : null}
          {activeModals.sharingModal.isActive ? (
            <SharingModal
              isOpen={activeModals.sharingModal.isActive}
              toggleModal={() => dispatch(actions.toggleActiveModal({ modalName: "sharingModal" }))}
              {...activeModals.sharingModal.props}
            />
          ) : null}
          {activeModals.emailLoginLinkPopup.isActive ? (
            <MailLoginLinkPopup
              isOpen={activeModals.emailLoginLinkPopup.isActive}
              toggleModal={() => {
                dispatch(actions.toggleActiveModal({ modalName: "emailLoginLinkPopup" }));
                dispatch(actions.updateTimeToResendEmailLogin(0));
              }}
              {...activeModals.emailLoginLinkPopup.props}
            />
          ) : null}

          {isImportRulesModalActive ? (
            <ImportRulesModal isOpen={isImportRulesModalActive} toggle={toggleImportRulesModal} />
          ) : null}
          {isJoinWorkspaceCardVisible && user.loggedIn ? <JoinWorkspaceCard /> : null}
        </>
      )}
    </>
  );
};

export default DashboardContent;
