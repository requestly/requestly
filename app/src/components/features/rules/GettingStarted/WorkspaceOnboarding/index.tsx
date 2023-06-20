import React, { useCallback, useState, useMemo, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  getUserAuthDetails,
  getWorkspaceOnboardingStep,
  getHasConnectedApp,
  getAppMode,
  getWorkspaceOnboardingTeamDetails,
} from "store/selectors";
import { getAvailableTeams } from "store/features/teams/selectors";
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
import { OnboardingSteps } from "./types";
import { getDomainFromEmail, isCompanyEmail } from "utils/FormattingHelper";
import { actions } from "store";
import { Team } from "types";
//@ts-ignore
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import "./index.css";
import { capitalize } from "lodash";

interface OnboardingProps {
  handleUploadRulesModalClick: () => void;
}

export const WorkspaceOnboarding: React.FC<OnboardingProps> = ({ handleUploadRulesModalClick }) => {
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const appMode = useSelector(getAppMode);
  const currentTeams = useSelector(getAvailableTeams);
  const step = useSelector(getWorkspaceOnboardingStep);
  const hasConnectedApps = useSelector(getHasConnectedApp);
  const workspaceOnboardingTeamDetails = useSelector(getWorkspaceOnboardingTeamDetails);

  const [defaultTeamData, setDefaultTeamData] = useState(null);
  const [availableTeams, setAvailableTeams] = useState<Team[]>([]);
  const [isPendingInvitePresent, setIsPendingInvitePresent] = useState<boolean>(false);

  const createTeam = useMemo(
    () => httpsCallable<{ teamName: string; generatePublicLink: boolean }>(getFunctions(), "teams-createTeam"),
    []
  );
  const getTeamsWithPendingInvites = useMemo(
    () =>
      httpsCallable<
        { email: boolean; domain: boolean },
        { teams: Team[]; success: boolean; isPendingInvitePresent?: boolean }
      >(getFunctions(), "teams-getTeamsWithPendingInvites"),
    []
  );

  const currentTestimonialIndex = useMemo(() => Math.floor(Math.random() * 3), []);
  const userEmailDomain = useMemo(() => getDomainFromEmail(user?.details?.profile?.email), [
    user?.details?.profile?.email,
  ]);

  const handleOnboardingCompletion = useCallback(() => {
    if (appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP && !hasConnectedApps) {
      dispatch(actions.toggleActiveModal({ modalName: "connectedAppsModal" }));
    }
  }, [appMode, dispatch, hasConnectedApps]);

  const handleAuthCompletion = useCallback(
    (isNewUser: boolean) => {
      if (isNewUser) dispatch(actions.updateWorkspaceOnboardingStep(OnboardingSteps.PERSONA_SURVEY));
      else dispatch(actions.updateIsWorkspaceOnboardingCompleted());
    },
    [dispatch]
  );

  const handleOnSurveyCompletion = useCallback(async () => {
    if (availableTeams.length === 0) {
      isEmailVerified(user?.details?.profile?.uid).then((result) => {
        if (result) {
          if (!isCompanyEmail(user?.details?.profile?.email)) {
            dispatch(actions.updateWorkspaceOnboardingStep(OnboardingSteps.RECOMMENDATIONS));
            return;
          }

          const newTeamName = `${capitalize(userEmailDomain?.split(".")?.[0]) ?? "my-team"}`;
          createTeam({
            teamName: newTeamName,
            generatePublicLink: true,
          }).then((response: any) => {
            setDefaultTeamData({ name: newTeamName, ...response?.data });
            dispatch(actions.updateWorkspaceOnboardingTeamDetails({ name: newTeamName, ...response?.data }));
          });

          setTimeout(() => {
            dispatch(actions.updateWorkspaceOnboardingStep(OnboardingSteps.CREATE_JOIN_WORKSPACE));
          }, 50);
        } else {
          dispatch(actions.updateWorkspaceOnboardingStep(OnboardingSteps.RECOMMENDATIONS));
        }
      });
    } else {
      dispatch(actions.updateWorkspaceOnboardingStep(OnboardingSteps.CREATE_JOIN_WORKSPACE));
    }
  }, [availableTeams.length, createTeam, dispatch, user?.details?.profile, userEmailDomain]);

  useEffect(() => {
    if (workspaceOnboardingTeamDetails) {
      setDefaultTeamData(workspaceOnboardingTeamDetails);
      dispatch(actions.updateWorkspaceOnboardingStep(OnboardingSteps.CREATE_JOIN_WORKSPACE));
    }
  }, [dispatch, workspaceOnboardingTeamDetails]);

  useEffect(() => {
    getTeamsWithPendingInvites({ email: true, domain: true })
      .then((res) => {
        setAvailableTeams(res.data?.teams ?? []);
        setIsPendingInvitePresent(res.data?.isPendingInvitePresent);
      })
      .catch((e) => setAvailableTeams([]));
  }, [getTeamsWithPendingInvites, user.details]);

  useEffect(() => {
    if (user?.loggedIn && step === OnboardingSteps.AUTH && currentTeams?.length) {
      dispatch(actions.updateIsWorkspaceOnboardingCompleted());
    }
  }, [dispatch, user?.loggedIn, currentTeams?.length, step]);

  useEffect(() => {
    return () => {
      handleOnboardingCompletion();
    };
  }, [handleOnboardingCompletion]);

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
                onClick={() => dispatch(actions.updateIsWorkspaceOnboardingCompleted())}
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
            availableTeams={availableTeams}
            isPendingInvite={isPendingInvitePresent}
          />
        );
    }
  }, [
    step,
    handleOnSurveyCompletion,
    defaultTeamData,
    availableTeams,
    isPendingInvitePresent,
    handleAuthCompletion,
    dispatch,
  ]);

  return (
    <>
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
    </>
  );
};
