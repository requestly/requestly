import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Divider, Row, Col, Tooltip, Button } from "antd";
import { RQButton } from "lib/design-system/components";
import { AuthFormInput } from "./components/AuthFormInput";
import googleLogo from "assets/icons/google.svg";
// import { PersonaInput } from "../../../persona/components/PersonaInput";
import { ONBOARDING_STEPS } from "features/onboarding/types";
import AUTH from "config/constants/sub/auth";
import { handleEmailSignIn, handleEmailSignUp, handleGoogleSignIn } from "./actions";
import { actions } from "store";
import { getGreeting, isEmailValid } from "utils/FormattingHelper";
import { toast } from "utils/Toast";
import { trackAppOnboardingStepCompleted } from "features/onboarding/analytics";
import { getAppMode, getUserAuthDetails } from "store/selectors";
import { isNull } from "lodash";
import { sendEmailLinkForSignin } from "actions/FirebaseActions";
import { updateTimeToResendEmailLogin } from "components/authentication/AuthForm/MagicAuthLinkModal/actions";
import Logger from "lib/logger";
// @ts-ignore
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import APP_CONSTANTS from "config/constants";
import { AuthTypes, getAuthErrorMessage } from "components/authentication/utils";
import { SSOSignInForm } from "./components/SSOSignInForm";
import { RequestPasswordResetForm } from "./components/RequestPasswordResetForm";
import { trackLoginWithSSOClicked, trackSignUpSignInSwitched } from "../../analytics";
import { AuthWarningBanner } from "./components/AuthWarningBanner";
import { isDisposableEmail } from "utils/AuthUtils";
import { useFeatureValue } from "@growthbook/growthbook-react";
import "./index.scss";

interface AuthFormProps {
  authMode: string;
  email?: string;
  isOnboarding: boolean;
  warningMessage?: string;
  source: string;
  setEmail?: (email: string) => void;
  setAuthMode: (mode: string) => void;
  setIsVerifyEmailPopupVisible?: (isVisble: boolean) => void;
  setIsAuthBannerVisible?: (isVisible: boolean) => void;
  toggleModal: () => void;
  callback: () => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({
  authMode,
  email,
  setAuthMode,
  isOnboarding,
  warningMessage,
  setIsVerifyEmailPopupVisible,
  setEmail,
  source,
  toggleModal,
  callback,
}) => {
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const appMode = useSelector(getAppMode);
  const [password, setPassword] = useState("");
  const [isGoogleSignInLoading, setIsGoogleSignInLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isNewUser, setIsNewUser] = useState(null);
  const [isAuthWarningBannerVisible, setIsAuthWarningBannerVisible] = useState(!!warningMessage?.length);

  const [isInputEmailDisposable, setIsInputEmailDisposable] = useState(false);
  const onboardingVariation = useFeatureValue("onboarding_activation_v2", "variant1");

  const handleSignupSigninSwitch = useCallback(() => {
    const finalState = authMode === AUTH.ACTION_LABELS.SIGN_UP ? AUTH.ACTION_LABELS.LOG_IN : AUTH.ACTION_LABELS.SIGN_UP;
    setAuthMode(finalState);
    trackSignUpSignInSwitched(finalState);
  }, [authMode, setAuthMode]);

  const handleSendEmailLink = useCallback(() => {
    if (email) {
      sendEmailLinkForSignin(email, source)
        .then(() => {
          updateTimeToResendEmailLogin(dispatch, 30);
          setIsVerifyEmailPopupVisible(true);
        })
        .catch((error) => {
          Logger.log(error);
        });
    }
  }, [email, source, dispatch, setIsVerifyEmailPopupVisible]);

  const handleGoogleSignInButtonClick = useCallback(() => {
    setIsGoogleSignInLoading(true);
    handleGoogleSignIn(appMode, authMode, source)
      .then((result) => {
        if (result.uid) {
          setIsNewUser(result?.isNewUser || false);
        }
        const greatingName = result.displayName?.split(" ")?.[0];
        !isOnboarding && toast.info(greatingName ? `${getGreeting()}, ${greatingName}` : "Welcome to Requestly");

        callback?.();
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        setIsGoogleSignInLoading(false);
      });
  }, [authMode, source, appMode, isOnboarding, callback]);

  const handleMagicLinkAuthClick = useCallback(() => {
    if (authMode === AUTH.ACTION_LABELS.LOG_IN || authMode === AUTH.ACTION_LABELS.SIGN_UP) {
      if (!email) {
        toast.error("Please enter your email address");
        return;
      }

      if (!isEmailValid(email)) {
        toast.error("Please enter a valid email address");
        return;
      }

      if (isDisposableEmail(email)) {
        setIsInputEmailDisposable(true);
        return;
      }
    }

    setIsLoading(true);
    dispatch(actions.updateIsAppOnboardingStepDisabled(true));
    handleSendEmailLink();
  }, [authMode, email, handleSendEmailLink, dispatch]);

  const handleEmailPasswordSignUp = useCallback(() => {
    setIsLoading(true);
    handleEmailSignUp(email, password, null, source)
      .then(({ status }) => {
        if (status) {
          handleEmailSignIn(email, password, true, source)
            .then(({ result }) => {
              if (result.user.uid) {
                const greatingName = result.user.displayName?.split(" ")?.[0];
                !isOnboarding &&
                  toast.info(greatingName ? `${getGreeting()}, ${greatingName}` : "Welcome to Requestly");
                setEmail("");
                setPassword("");
                callback?.();
              }
            })
            .catch((err) => {
              toast.error(getAuthErrorMessage(AuthTypes.SIGN_UP, err.errorCode));
              setEmail("");
              setPassword("");
            });
        }
      })
      .catch((err) => {
        toast.error(getAuthErrorMessage(AuthTypes.SIGN_UP, err.errorCode));
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [email, password, source, isOnboarding, setEmail, setPassword, callback]);

  const handleEmailPasswordSignIn = useCallback(() => {
    setIsLoading(true);
    handleEmailSignIn(email, password, false, source)
      .then(({ result }) => {
        if (result.user.uid) {
          const greatingName = result.user.displayName?.split(" ")?.[0];
          !isOnboarding && toast.info(greatingName ? `${getGreeting()}, ${greatingName}` : "Welcome to Requestly");
          setEmail("");
          setPassword("");
          callback?.();
        } else {
          toast.error("Sorry we couldn't log you in. Can you please retry?");
        }
      })
      .catch((err) => {
        toast.error(getAuthErrorMessage(AuthTypes.SIGN_IN, err.errorCode));
        setEmail("");
        setPassword("");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [email, password, source, isOnboarding, setEmail, setPassword, callback]);

  useEffect(() => {
    if (user.loggedIn && isOnboarding) {
      if (!isNull(isNewUser)) {
        trackAppOnboardingStepCompleted(ONBOARDING_STEPS.AUTH);
        if (isNewUser) {
          dispatch(actions.updateAppOnboardingStep(ONBOARDING_STEPS.PERSONA));
        } else {
          dispatch(actions.updateAppOnboardingCompleted());
        }
      }
    }
  }, [dispatch, user.loggedIn, isNewUser, isOnboarding]);

  if (authMode === AUTH.ACTION_LABELS.SSO) {
    return <SSOSignInForm email={email} setEmail={setEmail} setAuthMode={setAuthMode} source={source} />;
  }

  if (authMode === AUTH.ACTION_LABELS.REQUEST_RESET_PASSWORD) {
    return (
      <RequestPasswordResetForm email={email} setEmail={setEmail} setAuthMode={setAuthMode} toggleModal={toggleModal} />
    );
  }
  return onboardingVariation === "variant3" ? (
    <>
      <div className="w-full onboarding-auth-form-container">
        {authMode === AUTH.ACTION_LABELS.LOG_IN && warningMessage && isAuthWarningBannerVisible && (
          <AuthWarningBanner
            warningMessage={warningMessage}
            onBannerClose={() => setIsAuthWarningBannerVisible(false)}
          />
        )}
        <div className="variant3">
          <h2 className="onboarding-auth-form-header">
            {authMode === AUTH.ACTION_LABELS.SIGN_UP ? "Create your account" : "Sign in to your account"}
          </h2>
        </div>
        <RQButton
          type="default"
          className="onboarding-google-auth-button"
          onClick={handleGoogleSignInButtonClick}
          loading={isGoogleSignInLoading}
          disabled={isLoading}
        >
          <img src={googleLogo} alt="google" />
          {authMode === AUTH.ACTION_LABELS.SIGN_UP ? "Sign up with Google" : "Sign in with Google"}
        </RQButton>
        <Divider plain className="onboarding-auth-form-divider">
          Or
        </Divider>

        <AuthFormInput
          id="work-email"
          type="email"
          value={email}
          onValueChange={(email) => {
            setIsInputEmailDisposable(false);
            setEmail(email);
          }}
          status={isInputEmailDisposable ? "error" : null}
          placeholder="E.g., you@company.com"
          label={
            <label>
              <Row justify="space-between" align="middle">
                <Col>Your work email</Col>{" "}
                {authMode === AUTH.ACTION_LABELS.SIGN_UP && (
                  <Tooltip
                    placement="right"
                    title="Use your work email to use team workspaces, session replay and organization-level access controls."
                    color="var(--black)"
                  >
                    <Col className="why-work-email">Why work email?</Col>
                  </Tooltip>
                )}
              </Row>
            </label>
          }
          onPressEnter={appMode !== GLOBAL_CONSTANTS.APP_MODES.DESKTOP ? handleMagicLinkAuthClick : null}
        />
        {isInputEmailDisposable && (
          <div className="auth-email-disposable-error ">
            Please enter a valid email address. Temporary or disposable email addresses are not allowed.
          </div>
        )}
        {appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP && (
          <div className="mt-16">
            <AuthFormInput
              id="password"
              type="password"
              value={password}
              onValueChange={(value) => setPassword(value)}
              placeholder="Enter your password here"
              label="Password"
              onPressEnter={
                authMode === AUTH.ACTION_LABELS.SIGN_UP ? handleEmailPasswordSignUp : handleEmailPasswordSignIn
              }
            />
            {authMode === AUTH.ACTION_LABELS.LOG_IN && (
              <Button
                type="link"
                className="auth-screen-forgot-password-btn"
                onClick={() => setAuthMode(APP_CONSTANTS.AUTH.ACTION_LABELS.REQUEST_RESET_PASSWORD)}
              >
                Forgot password?
              </Button>
            )}
          </div>
        )}

        <RQButton
          type="primary"
          size="large"
          className="w-full mt-16 onboarding-continue-button"
          onClick={
            appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP
              ? authMode === APP_CONSTANTS.AUTH.ACTION_LABELS.SIGN_UP
                ? handleEmailPasswordSignUp
                : handleEmailPasswordSignIn
              : handleMagicLinkAuthClick
          }
          loading={isLoading}
          disabled={isGoogleSignInLoading}
        >
          {appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP
            ? authMode === APP_CONSTANTS.AUTH.ACTION_LABELS.SIGN_UP
              ? "Create new account"
              : "Sign in with email"
            : "Continue"}
        </RQButton>
        <RQButton
          block
          type="default"
          size="large"
          className="auth-screen-sso-btn"
          onClick={() => {
            setAuthMode(AUTH.ACTION_LABELS.SSO);
            trackLoginWithSSOClicked();
          }}
        >
          Continue with Single Sign-on (SSO)
        </RQButton>
      </div>

      <Row align="middle" className="text-bold onboarding-auth-mode-switch-wrapper variant3">
        <span>
          {authMode === AUTH.ACTION_LABELS.SIGN_UP ? "Already have an account?" : "Don't have an account yet?"}{" "}
        </span>
        <span onClick={handleSignupSigninSwitch} className="text-white onboarding-auth-mode-switcher">
          {authMode === AUTH.ACTION_LABELS.SIGN_UP ? "Sign in" : "Sign up now"}
        </span>
      </Row>
    </>
  ) : (
    <div className="w-full">
      {authMode === AUTH.ACTION_LABELS.LOG_IN && warningMessage && isAuthWarningBannerVisible && (
        <AuthWarningBanner warningMessage={warningMessage} onBannerClose={() => setIsAuthWarningBannerVisible(false)} />
      )}
      <h2 className="onboarding-auth-form-header">
        {authMode === AUTH.ACTION_LABELS.SIGN_UP ? "Create your account" : "Sign in to your account"}
      </h2>
      <Row align="middle" className="text-bold onboarding-auth-mode-switch-wrapper">
        <span>
          {authMode === AUTH.ACTION_LABELS.SIGN_UP ? "Already have an account?" : "Don't have an account yet?"}{" "}
        </span>
        <span onClick={handleSignupSigninSwitch} className="text-white onboarding-auth-mode-switcher">
          {authMode === AUTH.ACTION_LABELS.SIGN_UP ? "Sign in" : "Sign up now"}
        </span>
      </Row>
      <RQButton
        type="default"
        className="onboarding-google-auth-button"
        onClick={handleGoogleSignInButtonClick}
        loading={isGoogleSignInLoading}
        disabled={isLoading}
      >
        <img src={googleLogo} alt="google" />
        {authMode === AUTH.ACTION_LABELS.SIGN_UP ? "Sign up with Google" : "Sign in with Google"}
      </RQButton>
      <Divider plain className="onboarding-auth-form-divider">
        Or
      </Divider>

      <AuthFormInput
        id="work-email"
        type="email"
        value={email}
        onValueChange={(email) => {
          setIsInputEmailDisposable(false);
          setEmail(email);
        }}
        status={isInputEmailDisposable ? "error" : null}
        placeholder="E.g., you@company.com"
        label={
          <label>
            <Row justify="space-between" align="middle">
              <Col>Your work email</Col>{" "}
              {authMode === AUTH.ACTION_LABELS.SIGN_UP && (
                <Tooltip
                  placement="right"
                  title="Use your work email to use team workspaces, session replay and organization-level access controls."
                  color="var(--black)"
                >
                  <Col className="why-work-email">Why work email?</Col>
                </Tooltip>
              )}
            </Row>
          </label>
        }
        onPressEnter={appMode !== GLOBAL_CONSTANTS.APP_MODES.DESKTOP ? handleMagicLinkAuthClick : null}
      />
      {isInputEmailDisposable && (
        <div className="auth-email-disposable-error ">
          Please enter a valid email address. Temporary or disposable email addresses are not allowed.
        </div>
      )}
      {appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP && (
        <div className="mt-16">
          <AuthFormInput
            id="password"
            type="password"
            value={password}
            onValueChange={(value) => setPassword(value)}
            placeholder="Enter your password here"
            label="Password"
            onPressEnter={
              authMode === AUTH.ACTION_LABELS.SIGN_UP ? handleEmailPasswordSignUp : handleEmailPasswordSignIn
            }
          />
          {authMode === AUTH.ACTION_LABELS.LOG_IN && (
            <Button
              type="link"
              className="auth-screen-forgot-password-btn"
              onClick={() => setAuthMode(APP_CONSTANTS.AUTH.ACTION_LABELS.REQUEST_RESET_PASSWORD)}
            >
              Forgot password?
            </Button>
          )}
        </div>
      )}

      <RQButton
        type="primary"
        size="large"
        className="w-full mt-16 onboarding-continue-button"
        onClick={
          appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP
            ? authMode === APP_CONSTANTS.AUTH.ACTION_LABELS.SIGN_UP
              ? handleEmailPasswordSignUp
              : handleEmailPasswordSignIn
            : handleMagicLinkAuthClick
        }
        loading={isLoading}
        disabled={isGoogleSignInLoading}
      >
        {appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP
          ? authMode === APP_CONSTANTS.AUTH.ACTION_LABELS.SIGN_UP
            ? "Create new account"
            : "Sign in with email"
          : "Continue"}
      </RQButton>
      <RQButton
        block
        type="default"
        size="large"
        className="auth-screen-sso-btn"
        onClick={() => {
          setAuthMode(AUTH.ACTION_LABELS.SSO);
          trackLoginWithSSOClicked();
        }}
      >
        Continue with Single Sign-on (SSO)
      </RQButton>

      {authMode === AUTH.ACTION_LABELS.SIGN_UP && (
        <div className="onboarding-terms-text">
          I agree to the{" "}
          <a href="https://requestly.com/terms/" target="_blank" rel="noreferrer">
            terms
          </a>
          . Learn about how we use and protect your data in our{" "}
          <a href="https://requestly.com/privacy/">privacy policy</a>.
        </div>
      )}
    </div>
  );
};
