import React, { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "antd";
import AuthModalHeader from "features/onboarding/components/OnboardingHeader/OnboardingHeader";
import { CompaniesLogoBanner } from "features/onboarding/components/auth/components/CompaniesLogoBanner";
import { OnboardingCard } from "features/onboarding/components/OnboardingCard/OnboardingCard";
import APP_CONSTANTS from "config/constants";
import { EnterEmailCard } from "./components/EnterEmailCard/EnterEmailCard";
import { SignupWithBStackCard } from "./components/SignupWithBStackCard/SignupWithBStackCard";
import { MdOutlineInfo } from "@react-icons/all-files/md/MdOutlineInfo";
import { AuthErrorCode, AuthSyncMetadata } from "./types";
import { RQAuthCard } from "./components/RQAuthCard/RQAuthCard";
import { useDispatch } from "react-redux";
import { globalActions } from "store/slices/global/slice";
import { redirectToOAuthUrl } from "utils/RedirectionUtils";
import "./authScreen.scss";

interface AuthScreenProps {
  authModeOnMount?: string;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  authModeOnMount = APP_CONSTANTS.AUTH.ACTION_LABELS.LOG_IN,
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [email, setEmail] = useState("");
  const [authMode, setAuthMode] = useState(authModeOnMount);
  const [authErrorCode, setAuthErrorCode] = useState<AuthErrorCode>(AuthErrorCode.NONE);
  const [showRQAuthForm, setShowRQAuthForm] = useState(false);
  const [authProviders, setAuthProviders] = useState([]);
  const [ssoProviderId, setSSOProviderId] = useState<string | null>(null);

  const handleEmailChange = useCallback((value: string) => {
    setEmail(value);
  }, []);

  const handleCloseAuthModal = useCallback(() => {
    dispatch(
      globalActions.toggleActiveModal({
        modalName: "authModal",
        newValue: false,
      })
    );
  }, [dispatch]);

  const authErrorMessage = useMemo(() => {
    switch (authErrorCode) {
      case AuthErrorCode.DIFFERENT_USER:
        return "You're trying to use a different Google account than the one originally entered. Please try again with the correct email.";
      default:
        return "";
    }
  }, [authErrorCode]);

  const handlePostAuthSyncVerification = useCallback(
    (metadata: AuthSyncMetadata["syncData"]) => {
      setAuthErrorCode(AuthErrorCode.NONE);
      setAuthProviders(metadata.providers);
      if (metadata.isSyncedUser) {
        redirectToOAuthUrl(navigate);
      } else if (!metadata.isExistingUser) {
        setAuthMode(APP_CONSTANTS.AUTH.ACTION_LABELS.SIGN_UP);
      } else {
        setShowRQAuthForm(true);
      }
    },
    [navigate]
  );

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

  const handleOnBackClick = useCallback(() => {
    setShowRQAuthForm(false);
    setAuthMode(APP_CONSTANTS.AUTH.ACTION_LABELS.LOG_IN);
    setAuthErrorCode(AuthErrorCode.NONE);
  }, []);

  const handleFailedLogin = useCallback((code: AuthErrorCode) => {
    if (code === AuthErrorCode.DIFFERENT_USER) {
      setAuthErrorCode(AuthErrorCode.DIFFERENT_USER);
      setShowRQAuthForm(false);
      setAuthMode(APP_CONSTANTS.AUTH.ACTION_LABELS.LOG_IN);
    }
  }, []);

  const handleSuccessfulLogin = useCallback(() => {
    setShowRQAuthForm(false);
    setAuthMode(APP_CONSTANTS.AUTH.ACTION_LABELS.LOG_IN);
    handleCloseAuthModal();
  }, [handleCloseAuthModal]);

  const handleOnHeaderButtonClick = useCallback(() => {
    handleCloseAuthModal();
  }, [handleCloseAuthModal]);

  return (
    <div className="auth-screen-container">
      <div className="auth-screen-content">
        <AuthModalHeader onHeaderButtonClick={handleOnHeaderButtonClick} />
        {showRQAuthForm ? (
          <OnboardingCard>
            <RQAuthCard
              email={email}
              authProviders={authProviders}
              successfulLoginCallback={handleSuccessfulLogin}
              failedLoginCallback={handleFailedLogin}
              onBackClick={handleOnBackClick}
              toggleAuthModal={handleCloseAuthModal}
              ssoProviderId={ssoProviderId}
            />
          </OnboardingCard>
        ) : (
          <>
            <div className="w-full">
              {authErrorMessage.length ? (
                <div className="auth-screen-error-message">
                  <MdOutlineInfo />
                  <span>{authErrorMessage}</span>
                </div>
              ) : null}
              <OnboardingCard height={211}>
                {authMode === APP_CONSTANTS.AUTH.ACTION_LABELS.LOG_IN ? (
                  <EnterEmailCard
                    email={email}
                    onEmailChange={handleEmailChange}
                    onAuthSyncVerification={handlePostAuthSyncVerification}
                    setSSOProviderId={setSSOProviderId}
                  />
                ) : (
                  <SignupWithBStackCard onBackButtonClick={handleOnBackClick} />
                )}
              </OnboardingCard>
            </div>
            {authMode === APP_CONSTANTS.AUTH.ACTION_LABELS.SIGN_UP ? authModeToggleText : null}
          </>
        )}
      </div>
      <div className="auth-screen-footer">
        <CompaniesLogoBanner />
      </div>
    </div>
  );
};
