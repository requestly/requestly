import React, { useCallback, useState, useMemo, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getUserAuthDetails, getWorkspaceOnboardingStep } from "store/selectors";
import { getFunctions, httpsCallable } from "firebase/functions";
import { FullPageHeader } from "components/common/FullPageHeader";
import { AuthFormHero } from "components/authentication/AuthForm/AuthFormHero";
import { OnboardingAuthForm } from "./OnboardingSteps/OnboardingAuthForm";
import { GettingStartedWithSurvey } from "components/features/rules/GettingStarted/WorkspaceOnboarding/OnboardingSteps/PersonaSurvey/GettingStartedWithSurvey";
import { PersonaSurvey } from "./OnboardingSteps/PersonaSurvey";
import { isEmailVerified } from "utils/AuthUtils";
import { OnboardingSteps } from "./types";
import "./index.css";
import PersonaRecommendation from "../PersonaRecommendation";
import { WorkspaceOnboardingBanner } from "./OnboardingSteps/TeamWorkspaces/Banner";
import { WorkspaceOnboardingStep } from "./OnboardingSteps/TeamWorkspaces";
import { OnboardingBannerSteps } from "./BannerSteps";
import { actions } from "store";
import { getTeamsWithPendingInvites, getTeamsWithSameDomainEnabled } from "backend/teams";
import Logger from "lib/logger";

interface OnboardingProps {
  handleUploadRulesModalClick: () => void;
}

export const WorkspaceOnboarding: React.FC<OnboardingProps> = ({ handleUploadRulesModalClick }) => {
  const dispatch = useDispatch();
  const step = useSelector(getWorkspaceOnboardingStep);
  const [createdTeamData, setCreatedTeamData] = useState(null);
  const [availableTeams, setAvailableTeams] = useState([]);
  const [pendingTeams, setPendingTeams] = useState([]);

  const currentTestimonialIndex = useMemo(() => Math.floor(Math.random() * 3), []);

  const user = useSelector(getUserAuthDetails);
  const createTeam = httpsCallable(getFunctions(), "teams-createTeam");

  const handleOnSurveyCompletion = useCallback(async () => {
    if (pendingTeams.length === 0) {
      isEmailVerified(user?.details?.profile?.uid).then((result) => {
        if (result) {
          availableTeams.length === 0 &&
            createTeam({
              teamName: "MY NEW WORKSPACE",
              generatePublicLink: true,
            }).then((response: any) => {
              setCreatedTeamData(response?.data);
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
  }, [availableTeams.length, createTeam, dispatch, pendingTeams.length, user?.details?.profile?.uid]);

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

  useEffect(() => {
    getTeamsWithPendingInvites(user?.details?.profile?.email, user?.details?.profile?.uid)
      .then(setPendingTeams)
      .catch((e) => Logger.log("Not able to fetch team invites!"));
  }, [user?.details?.profile]);

  useEffect(() => {
    if (pendingTeams.length === 0) {
      getTeamsWithSameDomainEnabled(user?.details?.profile?.email, user?.details?.profile?.uid).then(setAvailableTeams);
    }
  }, [pendingTeams.length, user?.details?.profile]);

  const renderOnboardingActionComponent = useCallback(() => {
    switch (step) {
      case OnboardingSteps.AUTH:
        return (
          <OnboardingAuthForm
            callback={{
              onSignInSuccess: () => dispatch(actions.updateWorkspaceOnboardingStep(OnboardingSteps.PERSONA_SURVEY)),
            }}
          />
        );
      case OnboardingSteps.PERSONA_SURVEY:
        return <PersonaSurvey callback={handleOnSurveyCompletion} />;
      case OnboardingSteps.CREATE_JOIN_WORKSPACE:
        return (
          <WorkspaceOnboardingStep
            createdTeamData={createdTeamData}
            availableTeams={pendingTeams.length ? pendingTeams : availableTeams}
            isPendingInvite={pendingTeams.length > 0}
          />
        );
    }
  }, [step, handleOnSurveyCompletion, createdTeamData, pendingTeams, availableTeams, dispatch]);
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
