import React, { ReactNode, useState } from "react";
import { useDispatch } from "react-redux";
import { Divider, Row, Col, Tooltip } from "antd";
import { RQButton, RQInput } from "lib/design-system/components";
import googleLogo from "assets/icons/google.svg";
import { PersonaInput } from "../../../persona/components/personaInput";
import { ONBOARDING_STEPS } from "features/onboarding/types";
import AUTH from "config/constants/sub/auth";
import { googleSignIn } from "actions/FirebaseActions";
import { actions } from "store";
import "./index.scss";

interface AuthFormProps {
  authMode: string;
  setAuthMode: (mode: string) => void;
  onSendEmailLink?: (email: string) => void;
}

interface InputProps {
  id?: string;
  value: string;
  label: ReactNode | string;
  placeholder: string;
  onValueChange: (value: string) => void;
}

const FormInput: React.FC<InputProps> = ({ id, value, label, placeholder, onValueChange }) => {
  return (
    <div className="onboarding-form-input">
      {typeof label === "string" ? <label htmlFor={id}>{label}</label> : label}
      <RQInput placeholder={placeholder} id={id} value={value} onChange={(e) => onValueChange(e.target.value)} />
    </div>
  );
};

export const AuthForm: React.FC<AuthFormProps> = ({ authMode, setAuthMode, onSendEmailLink }) => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [persona, setPersona] = useState("");

  const handleGoogleSignIn = () => {
    setIsLoading(true);
    googleSignIn(() => {}, authMode, "app_onboarding")
      .then((result) => {
        if (result.uid) {
          dispatch(actions.updateAppOnboardingStep(ONBOARDING_STEPS.PERSONA));
        }
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <div className="w-full">
      <h2 className="onboarding-auth-form-header">
        {authMode === AUTH.ACTION_LABELS.SIGN_UP ? "Create your account" : "Sign in to your Requestly account"}
      </h2>
      <Row align="middle" className="text-bold onboarding-auth-mode-switch-wrapper">
        <span>Already using Requestly? </span>
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
        loading={isLoading}
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
      />
      {authMode === AUTH.ACTION_LABELS.SIGN_UP && (
        <>
          <div className="mt-16">
            <PersonaInput onValueChange={(value) => setPersona(value)} />
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
      )}

      <RQButton
        type="primary"
        size="large"
        className="w-full mt-16 onboarding-continue-button"
        onClick={() => {
          dispatch(actions.updateAppOnboardingPersona(persona));
          onSendEmailLink?.(email);
        }}
      >
        Continue
      </RQButton>
      <div className="onboarding-terms-text">
        I agree to the Requestly{" "}
        <a href="https://requestly.io/terms/" target="_blank" rel="noreferrer">
          terms
        </a>
        . Learn about how we use and protect your data in our <a href="https://requestly.io/privacy/">privacy policy</a>
        .
      </div>
    </div>
  );
};
