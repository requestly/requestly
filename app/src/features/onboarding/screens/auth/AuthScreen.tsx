import { useCallback, useState } from "react";
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
import {
  trackBstackLoginInitiated,
  trackLoginUserNotFound,
  trackSignInWithMagicLinkClicked,
  trackSignUpButtonClicked,
} from "modules/analytics/events/common/auth/signup";
import {
  trackLoginButtonClicked,
  trackLoginFailedEvent,
  trackLoginSuccessEvent,
  trackLoginUserSwitchedEmail,
} from "modules/analytics/events/common/auth/login";
import { setRedirectMetadata } from "features/onboarding/utils";
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
    eventSource,
    isClosable,
    isOnboarding,
    redirectURL,
  } = useAuthScreenContext();
  const [authErrorCode, setAuthErrorCode] = useState<AuthErrorCode>(AuthErrorCode.NONE);
  const [showRQAuthForm, setShowRQAuthForm] = useState(false);
  const [isEmailVerificationScreenVisible, setIsEmailVerificationScreenVisible] = useState(false);
  const isDesktopSignIn = location.pathname.includes(PATHS.AUTH.DEKSTOP_SIGN_IN.RELATIVE);

  const getAuthErrorMessage = useCallback(
    (authErrorCode: AuthErrorCode) => {
      switch (authErrorCode) {
        case AuthErrorCode.DIFFERENT_USER: {
          trackLoginUserSwitchedEmail(eventSource);
          return "You're trying to use a different Google account than the one originally entered. Please try again with the correct email.";
        }
        default: {
          return "";
        }
      }
    },
    [eventSource]
  );

  const handleSuccessfulLogin = useCallback(
    (authProvider: string) => {
      setAuthMode(APP_CONSTANTS.AUTH.ACTION_LABELS.LOG_IN);
      // @ts-ignore
      trackLoginSuccessEvent({ auth_provider: authProvider, source: eventSource });
      if (authScreenMode === AuthScreenMode.PAGE) {
        redirectToHome(appMode, navigate);
      }
    },
    [setAuthMode, appMode, navigate, authScreenMode, eventSource]
  );

  const handleOnHeaderButtonClick = useCallback(() => {
    if (isOnboarding) {
      dispatch(globalActions.updateIsOnboardingCompleted(true));
    }
    toggleAuthModal(false);
  }, [toggleAuthModal, isOnboarding, dispatch]);

  const handleSendEmailLink = useCallback(async () => {
    setIsSendEmailInProgress(true);
    trackSignInWithMagicLinkClicked();
    return sendEmailLinkForSignin(email, eventSource)
      .then(() => {
        setIsEmailVerificationScreenVisible(true);
      })
      .catch(() => {
        toast.error("Something went wrong, Could not send email link");
      })
      .finally(() => {
        setIsSendEmailInProgress(false);
      });
  }, [email, setIsSendEmailInProgress, eventSource]);

  const handlePostAuthSyncVerification = useCallback(
    (metadata: AuthSyncMetadata["syncData"]) => {
      setAuthErrorCode(AuthErrorCode.NONE);
      setAuthProviders(metadata.providers);
      if (metadata.isSyncedUser) {
        trackBstackLoginInitiated();
        setRedirectMetadata({ source: eventSource, redirectURL });
        redirectToOAuthUrl(navigate);
      } else if (!metadata.isExistingUser) {
        trackLoginUserNotFound(email);
        setAuthMode(APP_CONSTANTS.AUTH.ACTION_LABELS.SIGN_UP);
      } else {
        if (metadata.providers.length === 1 && metadata.providers[0] === AuthProvider.PASSWORD && !isDesktopSignIn) {
          handleSendEmailLink();
        } else {
          // Give google and password as default providers if no providers are found for existing user
          if (metadata.providers.length === 0) setAuthProviders([AuthProvider.GOOGLE, AuthProvider.PASSWORD]);
          setShowRQAuthForm(true);
        }
      }
    },
    [navigate, setAuthMode, setAuthProviders, handleSendEmailLink, isDesktopSignIn, email, redirectURL, eventSource]
  );

  const authModeToggleText = (
    <div className="auth-mode-toggle">
      {authMode === APP_CONSTANTS.AUTH.ACTION_LABELS.LOG_IN ? (
        <>
          Don't have an account?{" "}
          <Button
            type="link"
            size="small"
            onClick={() => {
              trackSignUpButtonClicked(eventSource);
              setRedirectMetadata({ source: eventSource, redirectURL });
              redirectToOAuthUrl(navigate);
            }}
          >
            Sign up
          </Button>
        </>
      ) : (
        <>
          Already have an account?{" "}
          <Button
            onClick={() => {
              trackLoginButtonClicked(eventSource);
              setAuthMode(APP_CONSTANTS.AUTH.ACTION_LABELS.LOG_IN);
            }}
            size="small"
            type="link"
          >
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
    (code: AuthErrorCode, authProvider: string) => {
      setAuthErrorCode(code);
      // @ts-ignore
      trackLoginFailedEvent({ auth_provider: authProvider, error_code: code, source: eventSource });
      if (code === AuthErrorCode.DIFFERENT_USER) {
        setShowRQAuthForm(false);
        setIsEmailVerificationScreenVisible(false);
        setAuthMode(APP_CONSTANTS.AUTH.ACTION_LABELS.LOG_IN);
      }
    },
    [setAuthMode, eventSource]
  );

  const authErrorMessage = getAuthErrorMessage(authErrorCode);

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
