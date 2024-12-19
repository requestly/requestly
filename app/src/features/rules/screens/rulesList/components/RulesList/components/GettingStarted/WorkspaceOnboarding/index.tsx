import React, { useCallback, useState, useMemo, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Modal } from "antd";
import {
  getWorkspaceOnboardingStep,
  getAppMode,
  getWorkspaceOnboardingTeamDetails,
  getUserPersonaSurveyDetails,
} from "store/selectors";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { getFunctions, httpsCallable } from "firebase/functions";
import { FullPageHeader } from "components/common/FullPageHeader";
import { AuthFormHero } from "components/authentication/AuthForm/AuthFormHero";
import { OnboardingAuthForm } from "./OnboardingSteps/OnboardingAuthForm";
import { GettingStartedWithSurvey } from "./OnboardingSteps/PersonaSurvey/SurveyBanner";
import PersonaRecommendation from "../PersonaRecommendation";
import { WorkspaceOnboardingBanner } from "./OnboardingSteps/TeamWorkspaces/Banner";
import { WorkspaceOnboardingStep } from "./OnboardingSteps/TeamWorkspaces";
import { OnboardingBannerSteps } from "./BannerSteps";
import { RQButton } from "lib/design-system/components";
import { isEmailVerified } from "utils/AuthUtils";
import { shouldShowOnboarding } from "components/misc/PersonaSurvey/utils";
import { isExtensionInstalled } from "actions/ExtensionActions";
import { OnboardingSteps } from "./types";
import { getDomainFromEmail, isCompanyEmail } from "utils/FormattingHelper";
import { getPendingInvites } from "backend/workspace";
import { globalActions } from "store/slices/global/slice";
import { Invite, InviteUsage } from "types";
import { PersonaSurvey } from "features/personaSurvey";
//@ts-ignore
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import "./index.css";
import { trackOnboardingWorkspaceSkip } from "modules/analytics/events/misc/onboarding";
import { trackNewTeamCreateSuccess, trackWorkspaceOnboardingViewed } from "modules/analytics/events/features/teams";
import { capitalize } from "lodash";
import { useWorkspaceHelpers } from "features/workspaces/hooks/useWorkspaceHelpers";
import { getAllWorkspaces } from "store/slices/workspaces/selectors";

interface OnboardingProps {
  isOpen: boolean;
  handleUploadRulesModalClick: () => void;
  toggle: () => void;
}

export const WorkspaceOnboarding: React.FC<OnboardingProps> = ({ isOpen, handleUploadRulesModalClick, toggle }) => {
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const appMode = useSelector(getAppMode);
  const availableWorkspaces = useSelector(getAllWorkspaces);
  const step = useSelector(getWorkspaceOnboardingStep);
  const workspaceOnboardingTeamDetails = useSelector(getWorkspaceOnboardingTeamDetails);
  const userPersona = useSelector(getUserPersonaSurveyDetails);

  const [isNewUserFromEmailLinkSignIn, setIsNewUserFromEmailLinkSignIn] = useState(false);
  const [defaultTeamData, setDefaultTeamData] = useState(null);
  const [pendingInvites, setPendingInvites] = useState<Invite[] | null>(null);

  const { switchWorkspace } = useWorkspaceHelpers();

  const createTeam = useMemo(
    () => httpsCallable<{ teamName: string; generatePublicLink: boolean }>(getFunctions(), "teams-createTeam"),
    []
  );
  const upsertTeamCommonInvite = useMemo(() => httpsCallable(getFunctions(), "invites-upsertTeamCommonInvite"), []);

  const isPendingEmailInvite = useMemo(() => pendingInvites?.some((invite) => invite.usage === InviteUsage.once), [
    pendingInvites,
  ]);
  const currentTestimonialIndex = useMemo(() => Math.floor(Math.random() * 3), []);
  const userEmailDomain = useMemo(() => getDomainFromEmail(user?.details?.profile?.email), [
    user?.details?.profile?.email,
  ]);

  const handleAuthCompletion = useCallback(
    (isNewUser: boolean) => {
      if (isNewUser) dispatch(globalActions.updateWorkspaceOnboardingStep(OnboardingSteps.PERSONA_SURVEY));
      else dispatch(globalActions.updateIsWorkspaceOnboardingCompleted());
    },
    [dispatch]
  );

  const handleOnSurveyCompletion = useCallback(async () => {
    if (isPendingEmailInvite) {
      dispatch(globalActions.updateWorkspaceOnboardingStep(OnboardingSteps.CREATE_JOIN_WORKSPACE));
      return;
    }

    const verifiedUser = await isEmailVerified(user?.details?.profile?.uid);
    if (verifiedUser && pendingInvites != null) {
      if (!isCompanyEmail(user?.details?.profile?.email)) {
        dispatch(globalActions.updateWorkspaceOnboardingStep(OnboardingSteps.RECOMMENDATIONS));
        return;
      }

      if (pendingInvites?.length === 0) {
        const newTeamName = `${capitalize(userEmailDomain?.split(".")?.[0]) ?? "my-team"}`;
        createTeam({
          teamName: newTeamName,
          generatePublicLink: true,
        }).then((response: any) => {
          upsertTeamCommonInvite({ teamId: response?.data?.teamId, domainEnabled: true });
          setDefaultTeamData({ name: newTeamName, ...response?.data });
          dispatch(
            globalActions.updateWorkspaceOnboardingTeamDetails({
              createdTeam: { name: newTeamName, ...response?.data },
            })
          );
          trackNewTeamCreateSuccess(response?.data?.teamId, newTeamName, "onboarding");
          switchWorkspace(response?.data?.teamId, "onboarding");
          setTimeout(() => {
            dispatch(globalActions.updateWorkspaceOnboardingStep(OnboardingSteps.RECOMMENDATIONS));
          }, 50);
        });
      } else {
        dispatch(globalActions.updateWorkspaceOnboardingStep(OnboardingSteps.CREATE_JOIN_WORKSPACE));
      }
    } else {
      dispatch(globalActions.updateWorkspaceOnboardingStep(OnboardingSteps.RECOMMENDATIONS));
    }
  }, [
    isPendingEmailInvite,
    user?.details?.profile?.uid,
    user?.details?.profile?.email,
    pendingInvites,
    dispatch,
    userEmailDomain,
    createTeam,
    upsertTeamCommonInvite,
    switchWorkspace,
  ]);

  useEffect(() => {
    setIsNewUserFromEmailLinkSignIn(!!window.localStorage.getItem("isNewUser"));
  }, []);

  useEffect(() => {
    if (step === OnboardingSteps.CREATE_JOIN_WORKSPACE) {
      if (workspaceOnboardingTeamDetails.createdTeam) {
        setDefaultTeamData(workspaceOnboardingTeamDetails.createdTeam);
        dispatch(globalActions.updateWorkspaceOnboardingStep(OnboardingSteps.CREATE_JOIN_WORKSPACE));
      } else if (workspaceOnboardingTeamDetails.pendingInvites?.length > 0) {
        setPendingInvites(workspaceOnboardingTeamDetails.pendingInvites);
        dispatch(globalActions.updateWorkspaceOnboardingStep(OnboardingSteps.CREATE_JOIN_WORKSPACE));
      }
    }
  }, [dispatch, step, workspaceOnboardingTeamDetails]);

  useEffect(() => {
    if (user?.loggedIn) {
      getPendingInvites({ email: true, domain: true })
        .then((res: any) => {
          setPendingInvites(res?.pendingInvites ?? []);
          dispatch(globalActions.updateWorkspaceOnboardingTeamDetails({ pendingInvites: res?.pendingInvites ?? [] }));
        })
        .catch((e) => {
          setPendingInvites([]);
        });
    }
  }, [dispatch, user?.loggedIn]);

  useEffect(() => {
    if (user?.loggedIn && step === OnboardingSteps.AUTH) {
      if (availableWorkspaces?.length) dispatch(globalActions.updateIsWorkspaceOnboardingCompleted());
      else if (isNewUserFromEmailLinkSignIn)
        dispatch(globalActions.updateWorkspaceOnboardingStep(OnboardingSteps.PERSONA_SURVEY));
      else dispatch(globalActions.updateWorkspaceOnboardingStep(OnboardingSteps.PERSONA_SURVEY));
    }
  }, [dispatch, user?.loggedIn, availableWorkspaces?.length, step, isNewUserFromEmailLinkSignIn]);

  useEffect(() => {
    if (appMode !== GLOBAL_CONSTANTS.APP_MODES.DESKTOP) {
      shouldShowOnboarding(appMode).then((result) => {
        if (result && isExtensionInstalled()) {
          trackWorkspaceOnboardingViewed();
          dispatch(globalActions.toggleActiveModal({ modalName: "workspaceOnboardingModal", newValue: true }));
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appMode, dispatch, window.location.href]);

  useEffect(() => {
    return () => {
      toggle();
    };
  }, [toggle]);

  useEffect(() => {
    if (userPersona?.page > 2) {
      dispatch(globalActions.updateIsWorkspaceOnboardingCompleted());
      window.localStorage.removeItem("isNewUser");
    }
  }, [dispatch, userPersona?.page]);

  const renderOnboardingBanner = useCallback(() => {
    switch (step) {
      case OnboardingSteps.AUTH:
        return <AuthFormHero currentTestimonialIndex={currentTestimonialIndex} />;
      case OnboardingSteps.PERSONA_SURVEY:
        return <GettingStartedWithSurvey />;
      case OnboardingSteps.CREATE_JOIN_WORKSPACE:
        return <WorkspaceOnboardingBanner />;
    }
  }, [step, currentTestimonialIndex]);

  const renderOnboardingActionComponent = useCallback(() => {
    switch (step) {
      case OnboardingSteps.AUTH:
        return (
          <div className="onboarding-auth-form">
            <RQButton
              className="display-block text-gray m-auto skip-onboarding-btn"
              type="text"
              onClick={() => {
                trackOnboardingWorkspaceSkip(OnboardingSteps.AUTH);
                dispatch(globalActions.updateWorkspaceOnboardingStep(OnboardingSteps.PERSONA_SURVEY));
              }}
            >
              Skip
            </RQButton>
            <OnboardingAuthForm
              callback={{
                onSignInSuccess: (uid, isNewUser) => handleAuthCompletion(isNewUser),
              }}
            />
          </div>
        );
      case OnboardingSteps.PERSONA_SURVEY:
        return <PersonaSurvey callback={handleOnSurveyCompletion} isSurveyModal={false} />;
      case OnboardingSteps.CREATE_JOIN_WORKSPACE:
        return (
          <WorkspaceOnboardingStep
            defaultTeamData={defaultTeamData}
            pendingInvites={pendingInvites}
            isPendingInvite={isPendingEmailInvite}
          />
        );
    }
  }, [
    step,
    handleOnSurveyCompletion,
    defaultTeamData,
    pendingInvites,
    isPendingEmailInvite,
    handleAuthCompletion,
    dispatch,
  ]);

  return (
    <Modal
      open={isOpen}
      centered
      footer={null}
      closable={false}
      width="100%"
      wrapClassName="onboarding-workspace-modal-wrapper"
      className="workspace-onboarding-modal"
    >
      {step === OnboardingSteps.RECOMMENDATIONS ? (
        <PersonaRecommendation isUserLoggedIn={user?.loggedIn} handleUploadRulesClick={handleUploadRulesModalClick} />
      ) : (
        <>
          <FullPageHeader />
          <div className="onboarding-content-wrapper">
            <div className="onboarding-content-banner">
              <OnboardingBannerSteps step={step} />
              {renderOnboardingBanner()}
            </div>
            <div className="onboarding-action-component">{renderOnboardingActionComponent()}</div>
          </div>
        </>
      )}
    </Modal>
  );
};
