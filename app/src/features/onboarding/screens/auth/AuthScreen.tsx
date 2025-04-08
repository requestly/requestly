import React, { useCallback, useState } from "react";
import { Button } from "antd";
import AuthModalHeader from "features/onboarding/components/OnboardingHeader/OnboardingHeader";
import { CompaniesLogoBanner } from "features/onboarding/components/auth/components/CompaniesLogoBanner";
import { OnboardingCard } from "features/onboarding/components/OnboardingCard/OnboardingCard";
import APP_CONSTANTS from "config/constants";
import { EnterEmailCard } from "./components/EnterEmailCard/EnterEmailCard";
import { SignupWithBStackCard } from "./components/SignupWithBStackCard/SignupWithBStackCard";
import { MdOutlineInfo } from "@react-icons/all-files/md/MdOutlineInfo";
import { AuthSyncMetadata, FailedLoginCode } from "./types";
import { RQAuthCard } from "./components/RQAuthCard/RQAuthCard";
import { useDispatch } from "react-redux";
import { globalActions } from "store/slices/global/slice";
import "./authScreen.scss";

interface AuthScreenProps {
  authModeOnMount?: string;
}

enum AuthScreenError {
  ACCOUNT_DOES_NOT_EXIST = "ACCOUNT_DOES_NOT_EXIST",
  DIFFERENT_USER = "DIFFERENT_USER",
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  authModeOnMount = APP_CONSTANTS.AUTH.ACTION_LABELS.LOG_IN,
}) => {
  const dispatch = useDispatch();

  const [email, setEmail] = useState("");
  const [authMode, setAuthMode] = useState(authModeOnMount);
  const [authErrorMessage, setAuthErrorMessage] = useState("");

  const [autoSignupWithBStack, setAutoSignupWithBStack] = useState(false);
  const [showRQAuthForm, setShowRQAuthForm] = useState(false);
  const [authProviders, setAuthProviders] = useState([]);

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

  const handleShowErrorMessage = useCallback((code: AuthScreenError) => {
    switch (code) {
      case AuthScreenError.ACCOUNT_DOES_NOT_EXIST:
        setAuthErrorMessage("No account exist for the provided email");
        break;
      case AuthScreenError.DIFFERENT_USER:
        setAuthErrorMessage(
          "You're trying to use a different Google account than the one originally entered. Please try again with the correct email."
        );
        break;
      default:
        setAuthErrorMessage("");
        break;
    }
  }, []);

  const handlePostAuthSyncVerification = useCallback(
    (metadata: AuthSyncMetadata["syncData"]) => {
      setAuthErrorMessage("");
      setAuthProviders(metadata.providers);
      if (metadata.isSyncedUser) {
        setAuthMode(APP_CONSTANTS.AUTH.ACTION_LABELS.SIGN_UP);
        setAutoSignupWithBStack(true);
      } else if (!metadata.isExistingUser) {
        handleShowErrorMessage(AuthScreenError.ACCOUNT_DOES_NOT_EXIST);
        setAuthMode(APP_CONSTANTS.AUTH.ACTION_LABELS.SIGN_UP);
      } else {
        setShowRQAuthForm(true);
      }
    },
    [handleShowErrorMessage]
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
    setAuthErrorMessage("");
  }, []);

  const handleFailedLogin = useCallback(
    (code: FailedLoginCode) => {
      if (code === FailedLoginCode.DIFFERENT_USER) {
        handleShowErrorMessage(AuthScreenError.DIFFERENT_USER);
        setShowRQAuthForm(false);
        setAuthMode(APP_CONSTANTS.AUTH.ACTION_LABELS.LOG_IN);
      }
    },
    [handleShowErrorMessage]
  );

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
        {autoSignupWithBStack ? (
          <OnboardingCard>
            <SignupWithBStackCard autoRedirect />
          </OnboardingCard>
        ) : showRQAuthForm ? (
          <OnboardingCard>
            <RQAuthCard
              email={email}
              authProviders={authProviders}
              successfulLoginCallback={handleSuccessfulLogin}
              failedLoginCallback={handleFailedLogin}
              onBackClick={handleOnBackClick}
              toggleAuthModal={handleCloseAuthModal}
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
                  />
                ) : (
                  <SignupWithBStackCard />
                )}
              </OnboardingCard>
            </div>
            {authModeToggleText}
          </>
        )}
      </div>
      <div className="auth-screen-footer">
        <CompaniesLogoBanner />
      </div>
    </div>
  );
};
