import React, { useCallback, useState } from "react";
import { Divider } from "antd";
import { GoogleAuthButton } from "./components/GoogleAuthButton/GoogleAuthButton";
import { EmailAuthForm } from "./components/EmailAuthForm/EmailAuthForm";
import { EmailVerificationCard } from "./components/EmailVerificationCard/EmailVerificationCard";
import { IoMdArrowBack } from "@react-icons/all-files/io/IoMdArrowBack";
import { AuthErrorCode, AuthProvider } from "../../types";
import { loginWithSSO, sendEmailLinkForSignin } from "actions/FirebaseActions";
import { toast } from "utils/Toast";
import { RQButton } from "lib/design-system-v2/components";
import "./rqAuthCard.scss";

interface RQAuthCardProps {
  email: string;
  authProviders: AuthProvider[];
  ssoProviderId: string | null;
  onBackClick: () => void;
  successfulLoginCallback: () => void;
  failedLoginCallback: (code: AuthErrorCode) => void;
  toggleAuthModal: () => void;
}

export const RQAuthCard: React.FC<RQAuthCardProps> = ({
  authProviders,
  email,
  ssoProviderId,
  onBackClick,
  successfulLoginCallback,
  failedLoginCallback,
  toggleAuthModal,
}) => {
  const [isEmailVerificationScreenVisible, setIsEmailVerificationScreenVisible] = useState(false);
  const [isSendEmailInProgress, setIsSendEmailInProgress] = useState(false);
  const [isSSOLoginInProgress, setIsSSOLoginInProgress] = useState(false);

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

  const handleSSOLogin = useCallback(async () => {
    setIsSSOLoginInProgress(true);
    try {
      await loginWithSSO(ssoProviderId, email);
      setIsSSOLoginInProgress(false);
      successfulLoginCallback();
    } catch (err) {
      failedLoginCallback(AuthErrorCode.UNKNOWN);
      toast.error("Something went wrong, Could not sign in with SSO");
      setIsSSOLoginInProgress(false);
    }
  }, [email, ssoProviderId, successfulLoginCallback, failedLoginCallback]);

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
      case AuthProvider.SSO:
        return (
          <RQButton loading={isSSOLoginInProgress} onClick={handleSSOLogin} className="mt-16" size="large" block>
            Sign in with SSO
          </RQButton>
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
              {index === 0 && authProviders.length > 1 ? <Divider plain>Or</Divider> : null}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
