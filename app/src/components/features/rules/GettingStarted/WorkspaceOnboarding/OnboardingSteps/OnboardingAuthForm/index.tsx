import React, { useState } from "react";
import AuthForm from "components/authentication/AuthForm";
import APP_CONSTANTS from "config/constants";

interface FormProps {
  callback: { onSignInSuccess: (uid: string, isNewUser: boolean) => void };
}

export const OnboardingAuthForm: React.FC<FormProps> = ({ callback }) => {
  const [authMode, setAuthMode] = useState(APP_CONSTANTS.AUTH.ACTION_LABELS.SIGN_UP);
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
