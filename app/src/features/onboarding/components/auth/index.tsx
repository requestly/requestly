import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getUserAuthDetails } from "store/selectors";
import { AuthForm } from "./components/Form";
import { OnboardingAuthBanner } from "./components/Banner";
import { AUTH_MODE, ONBOARDING_STEPS } from "features/onboarding/types";
import { actions } from "store";
import "./index.scss";

export const OnboardingAuthScreen: React.FC = () => {
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const [authMode, setAuthMode] = useState<AUTH_MODE>(AUTH_MODE.SIGNUP);

  useEffect(() => {
    if (user.loggedIn) {
      dispatch(actions.updateAppOnboardingStep(ONBOARDING_STEPS.PERSONA));
    }
  }, [dispatch, user.loggedIn]);

  return (
    <div className="onboarding-auth-screen-wrapper">
      <div className={`onboarding-auth-screen ${authMode === AUTH_MODE.SIGNUP ? "w-full" : ""}`}>
        <div className="onboarding-auth-form-wrapper">
          <AuthForm authMode={authMode} setAuthMode={setAuthMode} />
        </div>
        {authMode === AUTH_MODE.SIGNUP && (
          <div className="onboarding-auth-banner-wrapper">
            <OnboardingAuthBanner />
          </div>
        )}
      </div>
    </div>
  );
};
