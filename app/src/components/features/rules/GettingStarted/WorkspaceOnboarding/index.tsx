import React, { useCallback, useState, useMemo, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Modal } from "antd";
import {
  getUserAuthDetails,
  getWorkspaceOnboardingStep,
  getAppMode,
  getWorkspaceOnboardingTeamDetails,
  getUserPersonaSurveyDetails,
} from "store/selectors";
import { getAvailableTeams, getIsWorkspaceMode } from "store/features/teams/selectors";
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
import { PersonaSurvey } from "../../../../misc/PersonaSurvey";
import { isEmailVerified } from "utils/AuthUtils";
import { shouldShowOnboarding } from "components/misc/PersonaSurvey/utils";
import { isExtensionInstalled } from "actions/ExtensionActions";
import { OnboardingSteps } from "./types";
import { getDomainFromEmail, isCompanyEmail } from "utils/FormattingHelper";
import { getPendingInvites } from "backend/workspace";
import { actions } from "store";
import { Invite, InviteUsage } from "types";
//@ts-ignore
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import "./index.css";
import { trackOnboardingWorkspaceSkip } from "modules/analytics/events/misc/onboarding";
import { trackNewTeamCreateSuccess, trackWorkspaceOnboardingViewed } from "modules/analytics/events/features/teams";
import { capitalize } from "lodash";
import { switchWorkspace } from "actions/TeamWorkspaceActions";

interface OnboardingProps {
  isOpen: boolean;
  handleUploadRulesModalClick: () => void;
  toggle: () => void;
}

export const WorkspaceOnboarding: React.FC<OnboardingProps> = ({ isOpen, handleUploadRulesModalClick, toggle }) => {
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const appMode = useSelector(getAppMode);
  const isWorkspaceMode = useSelector(getIsWorkspaceMode);
  const currentTeams = useSelector(getAvailableTeams);
  const step = useSelector(getWorkspaceOnboardingStep);
  const workspaceOnboardingTeamDetails = useSelector(getWorkspaceOnboardingTeamDetails);
  const userPersona = useSelector(getUserPersonaSurveyDetails);

  const [isNewUserFromEmailLinkSignIn, setIsNewUserFromEmailLinkSignIn] = useState(false);
  const [defaultTeamData, setDefaultTeamData] = useState(null);
  const [pendingInvites, setPendingInvites] = useState<Invite[] | null>(null);

  const createTeam = useMemo(
    () => httpsCallable<{ teamName: string; generatePublicLink: boolean }>(getFunctions(), "teams-createTeam"),
    []
  );

  const isPendingEmailInvite = useMemo(() => pendingInvites?.some((invite) => invite.usage === InviteUsage.once), [
    pendingInvites,
  ]);
  const currentTestimonialIndex = useMemo(() => Math.floor(Math.random() * 3), []);
  const userEmailDomain = useMemo(() => getDomainFromEmail(user?.details?.profile?.email), [
    user?.details?.profile?.email,
  ]);

  const handleAuthCompletion = useCallback(
    (isNewUser: boolean) => {
      if (isNewUser) dispatch(actions.updateWorkspaceOnboardingStep(OnboardingSteps.PERSONA_SURVEY));
      else dispatch(actions.updateIsWorkspaceOnboardingCompleted());
    },
    [dispatch]
  );

  const handleOnSurveyCompletion = useCallback(async () => {
    if (isPendingEmailInvite) {
      dispatch(actions.updateWorkspaceOnboardingStep(OnboardingSteps.CREATE_JOIN_WORKSPACE));
      return;
    }

    const verifiedUser = await isEmailVerified(user?.details?.profile?.uid);
    if (verifiedUser && pendingInvites != null) {
      if (!isCompanyEmail(user?.details?.profile?.email)) {
        dispatch(actions.updateWorkspaceOnboardingStep(OnboardingSteps.RECOMMENDATIONS));
        return;
      }

      if (pendingInvites?.length === 0) {
        const newTeamName = `${capitalize(userEmailDomain?.split(".")?.[0]) ?? "my-team"}`;
        createTeam({
          teamName: newTeamName,
          generatePublicLink: true,
        }).then((response: any) => {
          setDefaultTeamData({ name: newTeamName, ...response?.data });
          dispatch(
            actions.updateWorkspaceOnboardingTeamDetails({ createdTeam: { name: newTeamName, ...response?.data } })
          );
          trackNewTeamCreateSuccess(response?.data?.teamId, newTeamName, "onboarding");
          switchWorkspace(
            {
              teamId: response?.data?.teamId,
              teamName: newTeamName,
              teamMembersCount: response?.data?.accessCount,
            },
            dispatch,
            { isWorkspaceMode, isSyncEnabled: true },
            appMode,
            null,
            "onboarding"
          );
          setTimeout(() => {
            dispatch(actions.updateWorkspaceOnboardingStep(OnboardingSteps.CREATE_JOIN_WORKSPACE));
          }, 50);
        });
      } else {
        dispatch(actions.updateWorkspaceOnboardingStep(OnboardingSteps.CREATE_JOIN_WORKSPACE));
      }
    } else {
      dispatch(actions.updateWorkspaceOnboardingStep(OnboardingSteps.RECOMMENDATIONS));
    }
  }, [
    pendingInvites,
    isPendingEmailInvite,
    user?.details?.profile?.uid,
    user?.details?.profile?.email,
    userEmailDomain,
    createTeam,
    dispatch,
    appMode,
    isWorkspaceMode,
  ]);

  useEffect(() => {
    setIsNewUserFromEmailLinkSignIn(!!window.localStorage.getItem("isNewUser"));
  }, []);

  useEffect(() => {
    if (step === OnboardingSteps.CREATE_JOIN_WORKSPACE) {
      if (workspaceOnboardingTeamDetails.createdTeam) {
        setDefaultTeamData(workspaceOnboardingTeamDetails.createdTeam);
        dispatch(actions.updateWorkspaceOnboardingStep(OnboardingSteps.CREATE_JOIN_WORKSPACE));
      } else if (workspaceOnboardingTeamDetails.pendingInvites?.length > 0) {
        setPendingInvites(workspaceOnboardingTeamDetails.pendingInvites);
        dispatch(actions.updateWorkspaceOnboardingStep(OnboardingSteps.CREATE_JOIN_WORKSPACE));
      }
    }
  }, [dispatch, step, workspaceOnboardingTeamDetails]);

  useEffect(() => {
    if (user?.loggedIn) {
      getPendingInvites({ email: true, domain: true })
        .then((res: any) => {
          setPendingInvites(res?.pendingInvites ?? []);
          dispatch(actions.updateWorkspaceOnboardingTeamDetails({ pendingInvites: res?.pendingInvites ?? [] }));
        })
        .catch((e) => {
          setPendingInvites([]);
        });
    }
  }, [dispatch, user?.loggedIn]);

  useEffect(() => {
    if (user?.loggedIn && step === OnboardingSteps.AUTH) {
      if (currentTeams?.length) dispatch(actions.updateIsWorkspaceOnboardingCompleted());
      else if (isNewUserFromEmailLinkSignIn)
        dispatch(actions.updateWorkspaceOnboardingStep(OnboardingSteps.PERSONA_SURVEY));
      else dispatch(actions.updateWorkspaceOnboardingStep(OnboardingSteps.PERSONA_SURVEY));
    }
  }, [dispatch, user?.loggedIn, currentTeams?.length, step, isNewUserFromEmailLinkSignIn]);

  useEffect(() => {
    if (appMode !== GLOBAL_CONSTANTS.APP_MODES.DESKTOP) {
      shouldShowOnboarding(appMode).then((result) => {
        if (result && isExtensionInstalled()) {
          trackWorkspaceOnboardingViewed();
          dispatch(actions.toggleActiveModal({ modalName: "workspaceOnboardingModal", newValue: true }));
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
      dispatch(actions.updateIsWorkspaceOnboardingCompleted());
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
          <div>
            <OnboardingAuthForm
              callback={{
                onSignInSuccess: (uid, isNewUser) => handleAuthCompletion(isNewUser),
              }}
            />
            <div className="display-row-center mt-20">
              <RQButton
                className="display-block text-gray m-auto"
                type="text"
                onClick={() => {
                  trackOnboardingWorkspaceSkip(OnboardingSteps.AUTH);
                  dispatch(actions.updateWorkspaceOnboardingStep(OnboardingSteps.PERSONA_SURVEY));
                }}
              >
                Skip for now
              </RQButton>
            </div>
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
