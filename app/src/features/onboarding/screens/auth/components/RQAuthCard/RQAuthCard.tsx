import React, { useCallback, useState } from "react";
import { Divider } from "antd";
import { GoogleAuthButton } from "./components/GoogleAuthButton/GoogleAuthButton";
import { EmailAuthForm } from "./components/EmailAuthForm/EmailAuthForm";
import { EmailVerificationCard } from "./components/EmailVerificationCard/EmailVerificationCard";
import { IoMdArrowBack } from "@react-icons/all-files/io/IoMdArrowBack";
import { FailedLoginCode, AuthProvider } from "../../types";
import { sendEmailLinkForSignin } from "actions/FirebaseActions";
import { toast } from "utils/Toast";
import "./rqAuthCard.scss";

interface RQAuthCardProps {
  email: string;
  authProviders: AuthProvider[];
  onBackClick: () => void;
  successfulLoginCallback: () => void;
  failedLoginCallback: (code: FailedLoginCode) => void;
  toggleAuthModal: () => void;
}

export const RQAuthCard: React.FC<RQAuthCardProps> = ({
  authProviders,
  onBackClick,
  email,
  successfulLoginCallback,
  failedLoginCallback,
  toggleAuthModal,
}) => {
  const [isEmailVerificationScreenVisible, setIsEmailVerificationScreenVisible] = useState(false);
  const [isSendEmailInProgress, setIsSendEmailInProgress] = useState(false);

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
  }, [email]);

  const renderAuthProvider = (provider: AuthProvider) => {
    switch (provider.toLowerCase()) {
      case AuthProvider.GOOGLE:
        return (
          <GoogleAuthButton
            email={email}
            successfulLoginCallback={successfulLoginCallback}
            failedLoginCallback={failedLoginCallback}
          />
        );
      case AuthProvider.PASSWORD:
        return (
          <EmailAuthForm
            email={email}
            isLoading={isSendEmailInProgress}
            onSendEmailClick={handleSendEmailLink}
            onEditEmailClick={onBackClick}
            authProviders={authProviders}
            toggleAuthModal={toggleAuthModal}
          />
        );
      default:
        return null;
    }
  };

  if (isEmailVerificationScreenVisible) {
    return (
      <EmailVerificationCard
        email={email}
        providers={authProviders}
        onBackClick={() => setIsEmailVerificationScreenVisible(false)}
        onResendEmailClick={handleSendEmailLink}
        isSendEmailInProgress={isSendEmailInProgress}
        toggleAuthModal={toggleAuthModal}
        failedLoginCallback={failedLoginCallback}
      />
    );
  }

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
