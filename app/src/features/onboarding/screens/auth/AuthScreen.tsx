import React, { useCallback, useState } from "react";
import { Button } from "antd";
import AuthModalHeader from "features/onboarding/components/OnboardingHeader/OnboardingHeader";
import { CompaniesLogoBanner } from "features/onboarding/components/auth/components/CompaniesLogoBanner";
import { OnboardingCard } from "features/onboarding/components/OnboardingCard/OnboardingCard";
import APP_CONSTANTS from "config/constants";
import { EnterEmailCard } from "./components/EnterEmailCard/EnterEmailCard";
import { SignupWithBStackCard } from "./components/SignupWithBStackCard/SignupWithBStackCard";
import { MdOutlineInfo } from "@react-icons/all-files/md/MdOutlineInfo";
import { AuthSyncMetadata } from "./types";
import "./authScreen.scss";

interface AuthScreenProps {
  authModeOnMount?: string;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  authModeOnMount = APP_CONSTANTS.AUTH.ACTION_LABELS.LOG_IN,
}) => {
  const [email, setEmail] = useState("");
  const [authMode, setAuthMode] = useState(authModeOnMount);
  const [showAccountDoesNotExistMessage, setShowAccountDoesNotExistMessage] = useState(false);

  const [autoSignupWithBStack, setAutoSignupWithBStack] = useState(false);
  const [showRQAuthForm, setShowRQAuthForm] = useState(false);
  const [authProviders, setAuthProviders] = useState([]);

  const handleEmailChange = useCallback((value: string) => {
    setEmail(value);
  }, []);

  const handlePostAuthSyncVerification = useCallback((metadata: AuthSyncMetadata["syncData"]) => {
    // TODO: REFACTOR THIS
    setAuthProviders(metadata.providers);
    if (metadata.isSyncedUser) {
      setShowAccountDoesNotExistMessage(true);
    } else if (!metadata.isExistingUser) {
      setAuthMode(APP_CONSTANTS.AUTH.ACTION_LABELS.SIGN_UP);
      setAutoSignupWithBStack(true);
    } else {
      setShowRQAuthForm(true);
    }
  }, []);

  const authModeToggleText = (
    <div className="auth-mode-toggle">
      {authMode === APP_CONSTANTS.AUTH.ACTION_LABELS.LOG_IN ? (
        <>
          Don't have an account?{" "}
          <Button onClick={() => setAuthMode(APP_CONSTANTS.AUTH.ACTION_LABELS.SIGN_UP)} size="small" type="link">
            Sign up
          </Button>
        </>
      ) : (
        <>
          Already have an account?{" "}
          <Button onClick={() => setAuthMode(APP_CONSTANTS.AUTH.ACTION_LABELS.LOG_IN)} size="small" type="link">
            Log in
          </Button>
        </>
      )}
    </div>
  );

  return (
    <div className="auth-screen-container">
      <div className="auth-screen-content">
        <AuthModalHeader />
        {autoSignupWithBStack ? (
          <OnboardingCard>
            <SignupWithBStackCard autoRedirect />
          </OnboardingCard>
        ) : showRQAuthForm ? (
          <div>SHOW RQ AUTH FORM VIEW HERE</div>
        ) : (
          <>
            <div className="auth-screen-account-does-not-exist-message">
              {showAccountDoesNotExistMessage ? (
                <>
                  <MdOutlineInfo />
                  <span>No account exist for the provided email</span>
                </>
              ) : (
                ""
              )}
            </div>
            <OnboardingCard height={211}>
              {authMode === APP_CONSTANTS.AUTH.ACTION_LABELS.LOG_IN ? (
                <EnterEmailCard
                  email={email}
                  onEmailChange={handleEmailChange}
                  onAuthSyncVerification={handlePostAuthSyncVerification}
                />
              ) : (
                <SignupWithBStackCard />
              )}
            </OnboardingCard>
            {authModeToggleText}
          </>
        )}
      </div>
      <div className="auth-screen-footer">
        {/* TEMPORARY */}
        <CompaniesLogoBanner />
      </div>
    </div>
  );
};
