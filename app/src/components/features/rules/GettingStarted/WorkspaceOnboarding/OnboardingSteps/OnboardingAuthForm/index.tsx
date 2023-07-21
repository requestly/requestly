import React, { useState, useEffect } from "react";
import { useGoogleOneTapLogin } from "hooks/useGoogleOneTapLogin";
import AuthForm from "components/authentication/AuthForm";
import APP_CONSTANTS from "config/constants";

interface FormProps {
  callback: { onSignInSuccess: (uid: string, isNewUser: boolean) => void };
}

export const OnboardingAuthForm: React.FC<FormProps> = ({ callback }) => {
  const { isNewUser, loggedInUsingOneTap } = useGoogleOneTapLogin();
  const [authMode, setAuthMode] = useState(APP_CONSTANTS.AUTH.ACTION_LABELS.SIGN_UP);

  useEffect(() => {
    if (loggedInUsingOneTap) {
      callback.onSignInSuccess(null, isNewUser);
    }
  }, [callback, isNewUser, loggedInUsingOneTap]);
  return (
    <>
      <AuthForm
        authMode={authMode}
        setAuthMode={setAuthMode}
        callbacks={callback}
        eventSource="onboarding_form"
        isOnboardingForm
      />
    </>
  );
};
