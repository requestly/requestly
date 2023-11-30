import React, { ReactNode } from "react";
import { Divider, Row, Col, Tooltip } from "antd";
import { RQButton, RQInput } from "lib/design-system/components";
import googleLogo from "assets/icons/google.svg";
import "./index.scss";
import { PersonaInput } from "../PersonaInput";

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

export const AuthForm = () => {
  return (
    <div className="w-full">
      <h2 className="onboarding-auth-form-header">Create your account</h2>
      <Row align="middle" className="text-bold onboarding-auth-mode-switch-wrapper">
        <span>Already using Requestly? </span>
        <span className="text-white onboarding-auth-mode-switcher">Sign in</span>
      </Row>
      <RQButton type="default" className="onboarding-google-auth-button">
        <img src={googleLogo} alt="google" />
        Sign up with Google
      </RQButton>
      <Divider plain className="onboarding-auth-form-divider">
        or sign up with email
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
      <div className="mt-16">
        <PersonaInput />
        <div className="persona-input-byline">Help us optimizing your Requestly experience</div>
      </div>
      <div className="mt-16">
        <FormInput id="full-name" value="" onChange={() => {}} placeholder="E.g., John Doe" label="Your full name" />
      </div>
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
