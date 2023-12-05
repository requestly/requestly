import React, { ReactNode } from "react";
import { Divider, Row, Col, Tooltip } from "antd";
import { RQButton, RQInput } from "lib/design-system/components";
import googleLogo from "assets/icons/google.svg";
import { PersonaInput } from "../PersonaInput";
import { AUTH_MODE } from "features/onboarding/types";
import { m, AnimatePresence } from "framer-motion";
import "./index.scss";

interface AuthFormProps {
  authMode: AUTH_MODE;
  setAuthMode: (mode: AUTH_MODE) => void;
}

interface InputProps {
  id?: string;
  value: string;
  label: ReactNode | string;
  placeholder: string;
  onChange: () => void;
}

const FormInput: React.FC<InputProps> = ({ id, value, label, placeholder, onChange }) => {
  return (
    <div className="onboarding-form-input">
      {typeof label === "string" ? <label htmlFor={id}>{label}</label> : label}
      <RQInput placeholder={placeholder} id={id} />
    </div>
  );
};

export const AuthForm: React.FC<AuthFormProps> = ({ authMode, setAuthMode }) => {
  return (
    <div className="w-full">
      <h2 className="onboarding-auth-form-header">
        {authMode === AUTH_MODE.SIGNUP ? "Create your account" : "Sign in to your Requestly account"}
      </h2>
      <Row align="middle" className="text-bold onboarding-auth-mode-switch-wrapper">
        <span>Already using Requestly? </span>
        <span
          onClick={() => setAuthMode(authMode === AUTH_MODE.SIGNUP ? AUTH_MODE.LOGIN : AUTH_MODE.SIGNUP)}
          className="text-white onboarding-auth-mode-switcher"
        >
          {authMode === AUTH_MODE.SIGNUP ? "Sign in" : "Sign up now"}
        </span>
      </Row>
      <RQButton type="default" className="onboarding-google-auth-button">
        <img src={googleLogo} alt="google" />
        {authMode === AUTH_MODE.SIGNUP ? "Sign up with Google" : "Sign in with Google"}
      </RQButton>
      <Divider plain className="onboarding-auth-form-divider">
        or {authMode === AUTH_MODE.SIGNUP ? "sign up with email" : "sign in with email"}
      </Divider>

      <FormInput
        id="work-email"
        value=""
        onChange={() => {}}
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
      <AnimatePresence>
        {authMode === AUTH_MODE.SIGNUP && (
          <m.div exit={{ opacity: 0, height: 0 }} initial={{ opacity: 1, height: "0" }} animate={{ height: "auto" }}>
            <div className="mt-16">
              <PersonaInput />
              <div className="persona-input-byline">Help us optimizing your Requestly experience</div>
            </div>
            <div className="mt-16">
              <FormInput
                id="full-name"
                value=""
                onChange={() => {}}
                placeholder="E.g., John Doe"
                label="Your full name"
              />
            </div>
          </m.div>
        )}
      </AnimatePresence>
      <RQButton type="primary" size="large" className="w-full mt-16 onboarding-continue-button">
        Continue
      </RQButton>
      <div className="onboarding-terms-text">
        I agree to the Requestly <a>terms</a>. Learn about how we use and protect your data in our <a>privacy policy</a>
        .
      </div>
    </div>
  );
};
