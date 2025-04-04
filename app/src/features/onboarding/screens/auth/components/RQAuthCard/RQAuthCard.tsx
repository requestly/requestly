import React from "react";
import { IoMdArrowBack } from "@react-icons/all-files/io/IoMdArrowBack";
import { FailedLoginCode, Provider } from "../../types";
import { GoogleAuthButton } from "./components/GoogleAuthButton/GoogleAuthButton";
import { Divider } from "antd";
import { EmailAuthForm } from "./components/EmailAuthForm/EmailAuthForm";
import "./rqAuthCard.scss";

interface RQAuthCardProps {
  email: string;
  authProviders: Provider[];
  onBackClick: () => void;
  successfulLoginCallback: () => void;
  failedLoginCallback: (code: FailedLoginCode) => void;
}

export const RQAuthCard: React.FC<RQAuthCardProps> = ({
  authProviders,
  onBackClick,
  email,
  successfulLoginCallback,
  failedLoginCallback,
}) => {
  const renderAuthProvider = (provider: Provider) => {
    switch (provider.toLowerCase()) {
      case Provider.GOOGLE:
        return (
          <GoogleAuthButton
            email={email}
            successfulLoginCallback={successfulLoginCallback}
            failedLoginCallback={failedLoginCallback}
          />
        );
      case Provider.PASSWORD:
        return <EmailAuthForm />;
      default:
        return null;
    }
  };

  return (
    <div className="rq-auth-card">
      <div className="rq-auth-card-header">
        <IoMdArrowBack onClick={onBackClick} />
        <span>Sign in to your account</span>
      </div>
      <div className="rq-auth-card__auth-options-container">
        {authProviders.map((provider, index) => {
          return (
            <React.Fragment key={index}>
              {renderAuthProvider(provider)}
              {index !== authProviders.length - 1 ? <Divider plain>Or</Divider> : null}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
