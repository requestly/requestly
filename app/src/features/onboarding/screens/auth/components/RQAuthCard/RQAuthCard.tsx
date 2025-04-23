import React, { useCallback, useMemo, useState } from "react";
import { Divider } from "antd";
import { GoogleAuthButton } from "./components/GoogleAuthButton/GoogleAuthButton";
import { EmailAuthForm } from "./components/EmailAuthForm/EmailAuthForm";
import { IoMdArrowBack } from "@react-icons/all-files/io/IoMdArrowBack";
import { AuthErrorCode, AuthProvider } from "../../types";
import { loginWithSSO } from "actions/FirebaseActions";
import { toast } from "utils/Toast";
import { RQButton } from "lib/design-system-v2/components";
import { useAuthScreenContext } from "../../context";
import "./rqAuthCard.scss";

interface RQAuthCardProps {
  onBackClick: () => void;
  handleSendEmailLink: () => Promise<void>;
  successfulLoginCallback: () => void;
  failedLoginCallback: (code: AuthErrorCode) => void;
}

export const RQAuthCard: React.FC<RQAuthCardProps> = ({
  onBackClick,
  handleSendEmailLink,
  successfulLoginCallback,
  failedLoginCallback,
}) => {
  const { email, authProviders, ssoProviderId, isSendEmailInProgress } = useAuthScreenContext();
  const [isSSOLoginInProgress, setIsSSOLoginInProgress] = useState(false);

  const isPasswordProviderUsed = useMemo(() => {
    return authProviders.includes(AuthProvider.PASSWORD);
  }, [authProviders]);

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
            successfulLoginCallback={successfulLoginCallback}
            failedLoginCallback={failedLoginCallback}
            type={isPasswordProviderUsed ? "secondary" : "primary"}
          />
        );
      case AuthProvider.PASSWORD:
        return (
          <EmailAuthForm
            isLoading={isSendEmailInProgress}
            onSendEmailClick={handleSendEmailLink}
            onEditEmailClick={onBackClick}
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
              {index === 0 && authProviders.length > 1 ? <Divider plain>or</Divider> : null}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
