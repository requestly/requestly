import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useSearchParams, Outlet } from "react-router-dom";
import SpinnerModal from "components/misc/SpinnerModal";
import { actions } from "store";
//UTILS
import {
  getActiveModals,
  getUserPersonaSurveyDetails,
  getUserAuthDetails,
  getAppMode,
  getAppOnboardingDetails,
  getIsWorkspaceOnboardingCompleted,
  getRequestBot,
} from "store/selectors";
import { getRouteFromCurrentPath } from "utils/URLUtils";
import SyncConsentModal from "../../components/user/SyncConsentModal";
import { trackPageViewEvent } from "modules/analytics/events/misc/pageView";
import { PersonaSurvey } from "components/misc/PersonaSurvey";
import ImportRulesModal from "components/features/rules/ImportRulesModal";
import ConnectedAppsModal from "components/mode-specific/desktop/MySources/Sources/index";
import InstallExtensionModal from "components/misc/InstallExtensionCTA/Modal";
import CreateWorkspaceModal from "componentsV2/modals/CreateWorkspaceModal";
import AddMemberModal from "features/settings/components/Profile/ManageTeams/TeamViewer/MembersDetails/AddMemberModal";
import SwitchWorkspaceModal from "componentsV2/modals/SwitchWorkspaceModal/SwitchWorkspaceModal";
import { usePrevious } from "hooks";
import JoinWorkspaceModal from "componentsV2/modals/JoinWorkspaceModal";
import { isAppOpenedInIframe } from "utils/AppUtils";
import { SharingModal } from "components/common/SharingModal";
import { PricingModal } from "features/pricing";
import MailLoginLinkPopup from "components/authentication/AuthForm/MagicAuthLinkModal";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import { isPricingPage } from "utils/PathUtils";
import { Onboarding, shouldShowOnboarding } from "features/onboarding";
import { RequestBillingTeamAccessReminder } from "features/settings";
import { useFeatureValue } from "@growthbook/growthbook-react";
import { IncentiveTaskCompletedModal, IncentiveTasksListModal } from "features/incentivization";
import { getIncentivizationActiveModals } from "store/features/incentivization/selectors";
import { incentivizationActions } from "store/features/incentivization/slice";
import { IncentivizationModal } from "store/features/incentivization/types";
import { RequestBot } from "features/requestBot";

const DashboardContent = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  //Global state
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const appMode = useSelector(getAppMode);
  const activeModals = useSelector(getActiveModals);
  const incentiveActiveModals = useSelector(getIncentivizationActiveModals);
  const userPersona = useSelector(getUserPersonaSurveyDetails);
  const appOnboardingDetails = useSelector(getAppOnboardingDetails);
  const isWorkspaceOnboardingCompleted = useSelector(getIsWorkspaceOnboardingCompleted);
  const [isImportRulesModalActive, setIsImportRulesModalActive] = useState(false);
  const isInsideIframe = useMemo(isAppOpenedInIframe, []);
  const onboardingVariation = useFeatureValue("onboarding_activation_v2", "variant1");
  const requestBotDetails = useSelector(getRequestBot);
  const isRequestBotVisible = requestBotDetails?.isActive;

  const toggleIncentiveTasksListModal = () => {
    dispatch(incentivizationActions.toggleActiveModal({ modalName: IncentivizationModal.TASKS_LIST_MODAL }));
  };

  const toggleIncentiveTaskCompletedModal = () => {
    dispatch(incentivizationActions.toggleActiveModal({ modalName: IncentivizationModal.TASK_COMPLETED_MODAL }));
  };

  const toggleSpinnerModal = () => {
    dispatch(actions.toggleActiveModal({ modalName: "loadingModal" }));
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

  const toggleImportRulesModal = () => {
    setIsImportRulesModalActive(isImportRulesModalActive ? false : true);
  };

  const closeRequestBot = () => {
    dispatch(actions.updateRequestBot({ isActive: false }));
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
          {incentiveActiveModals[IncentivizationModal.TASKS_LIST_MODAL]?.isActive ? (
            <IncentiveTasksListModal
              isOpen={incentiveActiveModals[IncentivizationModal.TASKS_LIST_MODAL]?.isActive}
              toggle={() => toggleIncentiveTasksListModal()}
              {...incentiveActiveModals[IncentivizationModal.TASKS_LIST_MODAL].props}
            />
          ) : null}
          {incentiveActiveModals[IncentivizationModal.TASK_COMPLETED_MODAL].isActive ? (
            <IncentiveTaskCompletedModal
              isOpen={incentiveActiveModals[IncentivizationModal.TASK_COMPLETED_MODAL]?.isActive}
              toggle={() => toggleIncentiveTaskCompletedModal()}
              {...incentiveActiveModals[IncentivizationModal.TASK_COMPLETED_MODAL].props}
            />
          ) : null}
          {activeModals.loadingModal.isActive ? (
            <SpinnerModal isOpen={activeModals.loadingModal.isActive} toggle={() => toggleSpinnerModal()} />
          ) : null}
          {activeModals.extensionModal.isActive ? (
            <InstallExtensionModal
              open={activeModals.extensionModal.isActive}
              onCancel={() => toggleExtensionModal()}
              eventPage="dashboard_content"
              {...activeModals.extensionModal.props}
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

          {activeModals.pricingModal.isActive ? (
            <PricingModal
              isOpen={activeModals.pricingModal.isActive}
              toggleModal={() => dispatch(actions.toggleActiveModal({ modalName: "pricingModal" }))}
              {...activeModals.pricingModal.props}
            />
          ) : null}

          {onboardingVariation !== "variant1" &&
            shouldShowOnboarding() &&
            appMode !== GLOBAL_CONSTANTS.APP_MODES.DESKTOP &&
            !appOnboardingDetails.isOnboardingCompleted && (
              <Onboarding isOpen={activeModals.appOnboardingModal.isActive} />
            )}

          {/* {isJoinWorkspaceCardVisible && user.loggedIn ? <JoinWorkspaceCard /> : null} */}
          {appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP ||
          isWorkspaceOnboardingCompleted ||
          appOnboardingDetails.isOnboardingCompleted ? (
            <RequestBillingTeamAccessReminder />
          ) : null}

          <RequestBot isOpen={isRequestBotVisible} onClose={closeRequestBot} modelType={requestBotDetails?.modelType} />
        </>
      )}
    </>
  );
};

export default DashboardContent;
