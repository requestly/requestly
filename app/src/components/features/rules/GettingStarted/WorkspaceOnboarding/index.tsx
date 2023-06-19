import React, { useCallback, useState, useMemo, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getUserAuthDetails, getWorkspaceOnboardingStep } from "store/selectors";
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
import { getSignupDate } from "utils/Misc";
import { OnboardingSteps } from "./types";
import { getDomainFromEmail } from "utils/FormattingHelper";
import { actions } from "store";
import { getTeamsWithPendingInvites, getTeamsWithSameDomainEnabled } from "backend/teams";
import Logger from "lib/logger";
import { Team } from "types";
import "./index.css";

interface OnboardingProps {
  handleUploadRulesModalClick: () => void;
}

export const WorkspaceOnboarding: React.FC<OnboardingProps> = ({ handleUploadRulesModalClick }) => {
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const currentTeams = useSelector(getAvailableTeams);
  const step = useSelector(getWorkspaceOnboardingStep);
  const [defaultTeamData, setDefaultTeamData] = useState(null);
  const [availableTeams, setAvailableTeams] = useState<Team[]>([]);
  const [pendingTeams, setPendingTeams] = useState<Team[]>([]);

  const createTeam = httpsCallable(getFunctions(), "teams-createTeam");

  const currentTestimonialIndex = useMemo(() => Math.floor(Math.random() * 3), []);
  const userEmailDomain = useMemo(() => getDomainFromEmail(user?.details?.profile?.email), [
    user?.details?.profile?.email,
  ]);

  const handleAuthCompletion = useCallback(() => {
    getSignupDate(window.uid).then((signup_date) => {
      if (new Date() > new Date(signup_date)) {
        console.log(new Date(), new Date(signup_date), "DATES");
        dispatch(actions.updateIsWorkspaceOnboardingCompleted());
      }
      dispatch(actions.updateWorkspaceOnboardingStep(OnboardingSteps.PERSONA_SURVEY));
    });
  }, [dispatch]);

  const handleOnSurveyCompletion = useCallback(async () => {
    if (pendingTeams.length === 0) {
      isEmailVerified(user?.details?.profile?.uid).then((result) => {
        if (result) {
          const newTeamName = `${userEmailDomain?.split(".")?.[0] ?? "my-team"}`;
          availableTeams.length === 0 &&
            createTeam({
              teamName: newTeamName,
              generatePublicLink: true,
            }).then((response: any) => {
              setDefaultTeamData({ name: newTeamName, ...response?.data });
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
  }, [availableTeams.length, createTeam, dispatch, pendingTeams.length, user?.details?.profile?.uid, userEmailDomain]);

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
                onSignInSuccess: handleAuthCompletion,
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
            availableTeams={pendingTeams.length ? pendingTeams : availableTeams}
            isPendingInvite={pendingTeams.length > 0}
          />
        );
    }
  }, [step, handleOnSurveyCompletion, defaultTeamData, pendingTeams, availableTeams, handleAuthCompletion]);

  useEffect(() => {
    getTeamsWithPendingInvites(user?.details?.profile?.email, user?.details?.profile?.uid)
      .then((teams: Team[]) => setPendingTeams(teams))
      .catch((e) => Logger.log("Not able to fetch team invites!"));
  }, [user?.details?.profile]);

  useEffect(() => {
    if (pendingTeams.length === 0) {
      getTeamsWithSameDomainEnabled(user?.details?.profile?.email, user?.details?.profile?.uid).then((teams: Team[]) =>
        setAvailableTeams(teams)
      );
    }
  }, [pendingTeams.length, user?.details?.profile]);

  useEffect(() => {
    if (user?.loggedIn && step === OnboardingSteps.AUTH && currentTeams?.length) {
      dispatch(actions.updateIsWorkspaceOnboardingCompleted());
    }
  }, [dispatch, user?.loggedIn, currentTeams?.length, step]);

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
