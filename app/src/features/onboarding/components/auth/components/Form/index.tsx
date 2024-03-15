import React, { ReactNode, useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Divider, Row, Col, Tooltip } from "antd";
import { RQButton, RQInput } from "lib/design-system/components";
import googleLogo from "assets/icons/google.svg";
// import { PersonaInput } from "../../../persona/components/PersonaInput";
import { ONBOARDING_STEPS } from "features/onboarding/types";
import AUTH from "config/constants/sub/auth";
import { googleSignIn } from "actions/FirebaseActions";
import { actions } from "store";
import { isEmailValid } from "utils/FormattingHelper";
import { toast } from "utils/Toast";
import { trackAppOnboardingStepCompleted } from "features/onboarding/analytics";
import { submitAttrUtil } from "utils/AnalyticsUtils";
import APP_CONSTANTS from "config/constants";
import { getUserAuthDetails } from "store/selectors";
import { isNull } from "lodash";
import "./index.scss";

interface AuthFormProps {
  authMode: string;
  setAuthMode: (mode: string) => void;
  onSendEmailLink?: (email: string) => void;
  email?: string;
  fullName?: string;
  persona?: string;
  setEmail?: (email: string) => void;
  setFullName?: (fullName: string) => void;
  setPersona?: (persona: string) => void;
}

interface InputProps {
  id?: string;
  value: string;
  label: ReactNode | string;
  placeholder: string;
  onValueChange: (value: string) => void;
  onPressEnter?: () => void;
}

const FormInput: React.FC<InputProps> = ({ id, value, label, placeholder, onValueChange, onPressEnter }) => {
  return (
    <div className="onboarding-form-input">
      {typeof label === "string" ? <label htmlFor={id}>{label}</label> : label}
      <RQInput
        onPressEnter={onPressEnter}
        placeholder={placeholder}
        id={id}
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
      />
    </div>
  );
};

export const AuthForm: React.FC<AuthFormProps> = ({
  authMode,
  setAuthMode,
  onSendEmailLink,
  email,
  fullName,
  persona,
  setEmail,
  setFullName,
  setPersona,
}) => {
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const [isGoogleSignInLoading, setIsGoogleSignInLoading] = useState(false);
  const [isMagicLinkLoading, setIsMagicLinkLoading] = useState(false);
  const [isNewUser, setIsNewUser] = useState(null);

  const handleGoogleSignIn = useCallback(() => {
    setIsGoogleSignInLoading(true);
    googleSignIn(() => {}, authMode, "app_onboarding")
      .then((result) => {
        if (result.uid) {
          setIsNewUser(result?.isNewUser || false);
        }
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        setIsGoogleSignInLoading(false);
      });
  }, [authMode]);

  const handleContinueClick = useCallback(() => {
    if (authMode === AUTH.ACTION_LABELS.LOG_IN || authMode === AUTH.ACTION_LABELS.SIGN_UP) {
      if (!email) {
        toast.error("Please enter your email address");
        return;
      }

      if (!isEmailValid(email)) {
        toast.error("Please enter a valid email address");
        return;
      }
    }

    setIsMagicLinkLoading(true);
    dispatch(actions.updateIsAppOnboardingStepDisabled(true));
    if (authMode === AUTH.ACTION_LABELS.SIGN_UP) {
      dispatch(actions.updateAppOnboardingPersona(persona));
      submitAttrUtil(APP_CONSTANTS.GA_EVENTS.ATTR.PERSONA, persona);
      dispatch(actions.updateAppOnboardingFullName(fullName));
    }
    onSendEmailLink?.(email);
  }, [authMode, email, fullName, persona, onSendEmailLink, dispatch]);

  useEffect(() => {
    if (user.loggedIn) {
      if (!isNull(isNewUser)) {
        trackAppOnboardingStepCompleted(ONBOARDING_STEPS.AUTH);
        if (isNewUser) {
          dispatch(actions.updateAppOnboardingStep(ONBOARDING_STEPS.PERSONA));
        } else {
          dispatch(actions.updateAppOnboardingCompleted());
        }
      }
    }
  }, [dispatch, user.loggedIn, isNewUser]);

  return (
    <div className="w-full">
      <h2 className="onboarding-auth-form-header">
        {authMode === AUTH.ACTION_LABELS.SIGN_UP ? "Create your account" : "Sign in to your Requestly account"}
      </h2>
      <Row align="middle" className="text-bold onboarding-auth-mode-switch-wrapper">
        <span>
          {authMode === AUTH.ACTION_LABELS.SIGN_UP ? "Already using Requestly?" : "Don't have an account yet?"}{" "}
        </span>
        <span
          onClick={() =>
            setAuthMode(
              authMode === AUTH.ACTION_LABELS.SIGN_UP ? AUTH.ACTION_LABELS.LOG_IN : AUTH.ACTION_LABELS.SIGN_UP
            )
          }
          className="text-white onboarding-auth-mode-switcher"
        >
          {authMode === AUTH.ACTION_LABELS.SIGN_UP ? "Sign in" : "Sign up now"}
        </span>
      </Row>
      <RQButton
        type="default"
        className="onboarding-google-auth-button"
        onClick={handleGoogleSignIn}
        loading={isGoogleSignInLoading}
        disabled={isMagicLinkLoading}
      >
        <img src={googleLogo} alt="google" />
        {authMode === AUTH.ACTION_LABELS.SIGN_UP ? "Sign up with Google" : "Sign in with Google"}
      </RQButton>
      <Divider plain className="onboarding-auth-form-divider">
        or {authMode === AUTH.ACTION_LABELS.SIGN_UP ? " sign up with email" : "sign in with email"}
      </Divider>

      <FormInput
        id="work-email"
        value={email}
        onValueChange={(email) => setEmail(email)}
        placeholder="E.g., you@company.com"
        label={
          <label>
            <Row justify="space-between" align="middle">
              <Col>Your work email</Col>{" "}
              <Tooltip
                placement="right"
                title="Use your work email to use team workspaces, session replay and orgazniation-level access controls."
                color="var(--black)"
              >
                <Col className="why-work-email">Why work email?</Col>
              </Tooltip>
            </Row>
          </label>
        }
        onPressEnter={handleContinueClick}
      />
      {/* {authMode === AUTH.ACTION_LABELS.SIGN_UP && (
        <>
          <div className="mt-16">
            <PersonaInput value={persona} onValueChange={(value) => setPersona(value)} />
            <div className="persona-input-byline">Help us optimizing your Requestly experience</div>
          </div>
          <div className="mt-16">
            <FormInput
              id="full-name"
              value={fullName}
              onValueChange={(name) => setFullName(name)}
              placeholder="E.g., John Doe"
              label="Your full name"
            />
          </div>
        </>
      )} */}

      <RQButton
        type="primary"
        size="large"
        className="w-full mt-16 onboarding-continue-button"
        onClick={handleContinueClick}
        loading={isMagicLinkLoading}
        disabled={isGoogleSignInLoading}
      >
        Continue
      </RQButton>
      <div className="onboarding-terms-text">
        I agree to the Requestly{" "}
        <a href="https://requestly.com/terms/" target="_blank" rel="noreferrer">
          terms
        </a>
        . Learn about how we use and protect your data in our{" "}
        <a href="https://requestly.com/privacy/">privacy policy</a>.
      </div>
    </div>
  );
};
