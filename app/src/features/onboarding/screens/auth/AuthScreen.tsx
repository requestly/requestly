import { useCallback, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "antd";
import AuthModalHeader from "features/onboarding/components/OnboardingHeader/OnboardingHeader";
import { CompaniesLogoBanner } from "features/onboarding/components/auth/components/CompaniesLogoBanner";
import { OnboardingCard } from "features/onboarding/componentsV2/OnboardingCard/OnboardingCard";
import APP_CONSTANTS from "config/constants";
import { EnterEmailCard } from "./components/EnterEmailCard/EnterEmailCard";
import { SignupWithBStackCard } from "./components/SignupWithBStackCard/SignupWithBStackCard";
import { MdOutlineInfo } from "@react-icons/all-files/md/MdOutlineInfo";
import { AuthErrorCode, AuthProvider, AuthScreenMode, AuthSyncMetadata } from "./types";
import { RQAuthCard } from "./components/RQAuthCard/RQAuthCard";
import { redirectToHome, redirectToOAuthUrl } from "utils/RedirectionUtils";
import { useAuthScreenContext } from "./context";
import { EmailVerificationCard } from "./components/RQAuthCard/components/EmailVerificationCard/EmailVerificationCard";
import { sendEmailLinkForSignin } from "actions/FirebaseActions";
import { toast } from "utils/Toast";
import { useDispatch, useSelector } from "react-redux";
import { getAppMode } from "store/selectors";
import { NewSignupCard } from "./components/NewSignupCard/NewSignupCard";
import PATHS from "config/constants/sub/paths";
import { globalActions } from "store/slices/global/slice";
import "./authScreen.scss";

export const AuthScreen = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const appMode = useSelector(getAppMode);
  const {
    email,
    authMode,
    authProviders,
    authScreenMode,
    isOnboardingScreenVisible,
    handleEmailChange,
    setAuthMode,
    setAuthProviders,
    toggleAuthModal,
    setIsSendEmailInProgress,
    isClosable,
    isOnboarding,
  } = useAuthScreenContext();
  const [authErrorCode, setAuthErrorCode] = useState<AuthErrorCode>(AuthErrorCode.NONE);
  const [showRQAuthForm, setShowRQAuthForm] = useState(false);
  const [isEmailVerificationScreenVisible, setIsEmailVerificationScreenVisible] = useState(false);
  const isDesktopSignIn = location.pathname.includes(PATHS.AUTH.DEKSTOP_SIGN_IN.RELATIVE);

  const authErrorMessage = useMemo(() => {
    switch (authErrorCode) {
      case AuthErrorCode.DIFFERENT_USER:
        return "You're trying to use a different Google account than the one originally entered. Please try again with the correct email.";
      default:
        return "";
    }
  }, [authErrorCode]);

  const handleSuccessfulLogin = useCallback(() => {
    // setShowRQAuthForm(false);
    setAuthMode(APP_CONSTANTS.AUTH.ACTION_LABELS.LOG_IN);
    if (authScreenMode === AuthScreenMode.PAGE) {
      redirectToHome(appMode, navigate);
    }
  }, [setAuthMode, appMode, navigate, authScreenMode]);

  const handleOnHeaderButtonClick = useCallback(() => {
    if (isOnboarding) {
      dispatch(globalActions.updateIsOnboardingCompleted(true));
    }
    toggleAuthModal(false);
  }, [toggleAuthModal, isOnboarding, dispatch]);

  const handleSendEmailLink = useCallback(async () => {
    setIsSendEmailInProgress(true);
    // TODO: ADD SOURCE
    return sendEmailLinkForSignin(email, "")
      .then(() => {
        setIsEmailVerificationScreenVisible(true);
      })
      .catch(() => {
        toast.error("Something went wrong, Could not send email link");
      })
      .finally(() => {
        setIsSendEmailInProgress(false);
      });
  }, [email, setIsSendEmailInProgress]);

  const handlePostAuthSyncVerification = useCallback(
    (metadata: AuthSyncMetadata["syncData"]) => {
      setAuthErrorCode(AuthErrorCode.NONE);
      setAuthProviders(metadata.providers);
      if (metadata.isSyncedUser) {
        redirectToOAuthUrl(navigate);
      } else if (!metadata.isExistingUser) {
        setAuthMode(APP_CONSTANTS.AUTH.ACTION_LABELS.SIGN_UP);
      } else {
        if (metadata.providers.length === 1 && metadata.providers[0] === AuthProvider.PASSWORD && !isDesktopSignIn) {
          handleSendEmailLink();
        } else {
          setShowRQAuthForm(true);
        }
      }
    },
    [navigate, setAuthMode, setAuthProviders, handleSendEmailLink, isDesktopSignIn]
  );

  const authModeToggleText = (
    <div className="auth-mode-toggle">
      {authMode === APP_CONSTANTS.AUTH.ACTION_LABELS.LOG_IN ? (
        <>
          Don't have an account?{" "}
          <Button onClick={() => redirectToOAuthUrl(navigate)} size="small" type="link">
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
  }, [setAuthMode]);

  const handleFailedLogin = useCallback(
    (code: AuthErrorCode) => {
      setAuthErrorCode(code);
      if (code === AuthErrorCode.DIFFERENT_USER) {
        setShowRQAuthForm(false);
        setIsEmailVerificationScreenVisible(false);
        setAuthMode(APP_CONSTANTS.AUTH.ACTION_LABELS.LOG_IN);
      }
    },
    [setAuthMode]
  );

  return (
    <div className="auth-screen-container">
      <div className="auth-screen-content">
        <AuthModalHeader
          hideCloseBtn={!isClosable || authScreenMode !== AuthScreenMode.MODAL}
          onHeaderButtonClick={handleOnHeaderButtonClick}
          isOnboarding={isOnboarding}
        />
        {isEmailVerificationScreenVisible ? (
          <OnboardingCard>
            <EmailVerificationCard
              onBackClick={() => {
                setIsEmailVerificationScreenVisible(false);
                if (authProviders.length > 1) {
                  setShowRQAuthForm(true);
                }
              }}
              onResendEmailClick={handleSendEmailLink}
              failedLoginCallback={handleFailedLogin}
            />
          </OnboardingCard>
        ) : showRQAuthForm ? (
          <OnboardingCard>
            <RQAuthCard
              handleSendEmailLink={handleSendEmailLink}
              successfulLoginCallback={handleSuccessfulLogin}
              failedLoginCallback={handleFailedLogin}
              onBackClick={handleOnBackClick}
            />
          </OnboardingCard>
        ) : (
          <>
            {isOnboardingScreenVisible ? (
              <NewSignupCard />
            ) : (
              <>
                <div className="w-full">
                  {authErrorMessage.length ? (
                    <div className="auth-screen-error-message">
                      <MdOutlineInfo />
                      <span>{authErrorMessage}</span>
                    </div>
                  ) : null}
                  <OnboardingCard>
                    {authMode === APP_CONSTANTS.AUTH.ACTION_LABELS.LOG_IN ? (
                      <EnterEmailCard
                        onEmailChange={handleEmailChange}
                        onAuthSyncVerification={handlePostAuthSyncVerification}
                      />
                    ) : (
                      <SignupWithBStackCard onBackButtonClick={handleOnBackClick} />
                    )}
                  </OnboardingCard>
                </div>
                {authModeToggleText}
              </>
            )}
          </>
        )}
      </div>
      <div className="auth-screen-footer">
        <CompaniesLogoBanner />
      </div>
    </div>
  );
};
