import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getUserAuthDetails } from "store/selectors";
import { AuthForm } from "./components/Form";
import { OnboardingAuthBanner } from "./components/Banner";
import AUTH from "config/constants/sub/auth";
import { ONBOARDING_STEPS } from "features/onboarding/types";
import { actions } from "store";
import "./index.scss";

export const OnboardingAuthScreen: React.FC = () => {
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const [authMode, setAuthMode] = useState(AUTH.ACTION_LABELS.SIGN_UP);

  useEffect(() => {
    if (user.loggedIn) {
      dispatch(actions.updateAppOnboardingStep(ONBOARDING_STEPS.PERSONA));
    }
  }, [dispatch, user.loggedIn]);

  return (
    <div className="onboarding-auth-screen-wrapper">
      <div className={`onboarding-auth-screen ${authMode === AUTH.ACTION_LABELS.SIGN_UP ? "w-full" : ""}`}>
        <div className="onboarding-auth-form-wrapper">
          <AuthForm authMode={authMode} setAuthMode={setAuthMode} />
        </div>
        {authMode === AUTH.ACTION_LABELS.SIGN_UP && (
          <div className="onboarding-auth-banner-wrapper">
            <OnboardingAuthBanner />
          </div>
        )}
      </div>
    </div>
  );
};
