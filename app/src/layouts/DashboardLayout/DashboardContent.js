import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useSearchParams, Outlet } from "react-router-dom";
import SpinnerModal from "components/misc/SpinnerModal";
import { globalActions } from "store/slices/global/slice";
//UTILS
import { getAppOnboardingDetails, getIsOnboardingCompleted, getRequestBot } from "store/selectors";
import { getActiveModals } from "store/slices/global/modals/selectors";
import { getRouteFromCurrentPath } from "utils/URLUtils";
import SyncConsentModal from "../../components/user/SyncConsentModal";
import { trackPageViewEvent } from "modules/analytics/events/misc/pageView";
import ImportRulesModal from "components/features/rules/ImportRulesModal";
import ConnectedAppsModal from "components/mode-specific/desktop/MySources/Sources/index";
import InstallExtensionModal from "components/misc/InstallExtensionCTA/Modal";
import CreateWorkspaceModal from "componentsV2/modals/CreateWorkspaceModal";
import { CreateWorkspaceModalV2 } from "componentsV2/modals/CreateWorkspaceModalV2/CreateWorkspaceModal";
import AddMemberModal from "features/settings/components/Profile/ManageTeams/TeamViewer/MembersDetails/AddMemberModal";
import SwitchWorkspaceModal from "componentsV2/modals/SwitchWorkspaceModal/SwitchWorkspaceModal";
import { usePrevious } from "hooks";
import JoinWorkspaceModal from "componentsV2/modals/JoinWorkspaceModal";
import { isAppOpenedInIframe } from "utils/AppUtils";
import { SharingModal } from "components/common/SharingModal";
import { PricingModal } from "features/pricing";
import MailLoginLinkPopup from "components/authentication/AuthForm/MagicAuthLinkModal";
import { isPricingPage } from "utils/PathUtils";
import { Onboarding, shouldShowOnboarding } from "features/onboarding";
import { RequestBillingTeamAccessReminder } from "features/settings";
import { useFeatureValue } from "@growthbook/growthbook-react";
import { IncentiveTaskCompletedModal, IncentiveTasksListModal } from "features/incentivization";
import { getIncentivizationActiveModals } from "store/features/incentivization/selectors";
import { incentivizationActions } from "store/features/incentivization/slice";
import { IncentivizationModal } from "store/features/incentivization/types";
import { RequestBot } from "features/requestBot";
import { useCheckLocalSyncSupport } from "features/apiClient/helpers/modules/sync/useCheckLocalSyncSupport";
import { OnboardingModal, PersonaSurveyModal, AcquisitionAnnouncementModal } from "features/onboarding";
import { useIsBrowserStackIntegrationOn } from "hooks/useIsBrowserStackIntegrationOn";

const DashboardContent = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  //Global state
  const dispatch = useDispatch();
  const activeModals = useSelector(getActiveModals);
  const incentiveActiveModals = useSelector(getIncentivizationActiveModals);
  const appOnboardingDetails = useSelector(getAppOnboardingDetails);
  const isLocalSyncEnabled = useCheckLocalSyncSupport({ skipWorkspaceCheck: true });
  const [isImportRulesModalActive, setIsImportRulesModalActive] = useState(false);
  const isInsideIframe = useMemo(isAppOpenedInIframe, []);
  const onboardingVariation = useFeatureValue("onboarding_activation_v2", "variant1");
  const requestBotDetails = useSelector(getRequestBot);
  const isBrowserstackIntegrationOn = useIsBrowserStackIntegrationOn();
  const isRequestBotVisible = requestBotDetails?.isActive;
  const isOnboardingCompleted = useSelector(getIsOnboardingCompleted);

  const toggleIncentiveTasksListModal = () => {
    dispatch(incentivizationActions.toggleActiveModal({ modalName: IncentivizationModal.TASKS_LIST_MODAL }));
  };

  const toggleIncentiveTaskCompletedModal = () => {
    dispatch(incentivizationActions.toggleActiveModal({ modalName: IncentivizationModal.TASK_COMPLETED_MODAL }));
  };

  const toggleSpinnerModal = () => {
    dispatch(globalActions.toggleActiveModal({ modalName: "loadingModal" }));
  };

  const toggleExtensionModal = () => {
    dispatch(globalActions.toggleActiveModal({ modalName: "extensionModal" }));
  };
  const toggleSyncConsentModal = () => {
    dispatch(globalActions.toggleActiveModal({ modalName: "syncConsentModal" }));
  };
  const toggleConnectedAppsModal = () => {
    dispatch(globalActions.toggleActiveModal({ modalName: "connectedAppsModal" }));
  };

  const toggleImportRulesModal = () => {
    setIsImportRulesModalActive(isImportRulesModalActive ? false : true);
  };

  const closeRequestBot = () => {
    dispatch(globalActions.updateRequestBot({ isActive: false }));
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
          {activeModals.createWorkspaceModal.isActive ? (
            isLocalSyncEnabled ? (
              <CreateWorkspaceModalV2
                isOpen={activeModals.createWorkspaceModal.isActive}
                toggleModal={() => dispatch(globalActions.toggleActiveModal({ modalName: "createWorkspaceModal" }))}
                {...activeModals.createWorkspaceModal.props}
              />
            ) : (
              <CreateWorkspaceModal
                isOpen={activeModals.createWorkspaceModal.isActive}
                toggleModal={() => dispatch(globalActions.toggleActiveModal({ modalName: "createWorkspaceModal" }))}
                {...activeModals.createWorkspaceModal.props}
              />
            )
          ) : null}

          {activeModals.inviteMembersModal.isActive ? (
            <AddMemberModal
              isOpen={activeModals.inviteMembersModal.isActive}
              toggleModal={() => dispatch(globalActions.toggleActiveModal({ modalName: "inviteMembersModal" }))}
              {...activeModals.inviteMembersModal.props}
            />
          ) : null}
          {activeModals.switchWorkspaceModal.isActive ? (
            <SwitchWorkspaceModal
              isOpen={activeModals.switchWorkspaceModal.isActive}
              toggleModal={() => dispatch(globalActions.toggleActiveModal({ modalName: "switchWorkspaceModal" }))}
              {...activeModals.switchWorkspaceModal.props}
            />
          ) : null}
          {activeModals.joinWorkspaceModal.isActive ? (
            <JoinWorkspaceModal
              isOpen={activeModals.joinWorkspaceModal.isActive}
              toggleModal={() => dispatch(globalActions.toggleActiveModal({ modalName: "joinWorkspaceModal" }))}
              {...activeModals.joinWorkspaceModal.props}
            />
          ) : null}
          {activeModals.sharingModal.isActive ? (
            <SharingModal
              isOpen={activeModals.sharingModal.isActive}
              toggleModal={() => dispatch(globalActions.toggleActiveModal({ modalName: "sharingModal" }))}
              {...activeModals.sharingModal.props}
            />
          ) : null}
          {activeModals.emailLoginLinkPopup.isActive ? (
            <MailLoginLinkPopup
              isOpen={activeModals.emailLoginLinkPopup.isActive}
              toggleModal={() => {
                dispatch(globalActions.toggleActiveModal({ modalName: "emailLoginLinkPopup" }));
                dispatch(globalActions.updateTimeToResendEmailLogin(0));
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
              toggleModal={() => dispatch(globalActions.toggleActiveModal({ modalName: "pricingModal" }))}
              {...activeModals.pricingModal.props}
            />
          ) : null}
          {isBrowserstackIntegrationOn ? (
            <>
              {!isOnboardingCompleted ? <OnboardingModal /> : null}
              <PersonaSurveyModal />
              <AcquisitionAnnouncementModal />
            </>
          ) : (
            <>
              {onboardingVariation !== "variant1" &&
                shouldShowOnboarding() &&
                !appOnboardingDetails.isOnboardingCompleted && (
                  <Onboarding isOpen={activeModals.appOnboardingModal.isActive} />
                )}{" "}
            </>
          )}

          <RequestBillingTeamAccessReminder />

          <RequestBot isOpen={isRequestBotVisible} onClose={closeRequestBot} modelType={requestBotDetails?.modelType} />
        </>
      )}
    </>
  );
};

export default DashboardContent;
