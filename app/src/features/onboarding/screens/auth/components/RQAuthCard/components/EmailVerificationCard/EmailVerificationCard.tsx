import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Divider } from "antd";
import { AuthProvider, FailedLoginCode } from "features/onboarding/screens/auth/types";
import { IoMdArrowBack } from "@react-icons/all-files/io/IoMdArrowBack";
import { RQButton } from "lib/design-system-v2/components";
import { GoogleAuthButton } from "../GoogleAuthButton/GoogleAuthButton";
import "./emailVerificationCard.scss";

interface EmailVerificationCardProps {
  email: string;
  providers: AuthProvider[];
  onBackClick: () => void;
  onResendEmailClick: () => Promise<void>;
  isSendEmailInProgress: boolean;
  toggleAuthModal: () => void;
  failedLoginCallback: (code: FailedLoginCode) => void;
}

export const EmailVerificationCard: React.FC<EmailVerificationCardProps> = ({
  email,
  providers,
  isSendEmailInProgress,
  onBackClick,
  onResendEmailClick,
  toggleAuthModal,
  failedLoginCallback,
}) => {
  const [countdown, setCountdown] = useState(20);

  /* Memoized google auth button component because countdown triggers re-render 
    which causes google auth button to be re-rendered (causes flicker in button) 
  */
  const googleAuthButton = useMemo(() => {
    return (
      <GoogleAuthButton
        email={email}
        successfulLoginCallback={toggleAuthModal}
        failedLoginCallback={failedLoginCallback}
      />
    );
  }, [email, toggleAuthModal, failedLoginCallback]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (countdown > 0) {
        setCountdown(countdown - 1);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [countdown]);

  const handleResendEmailClick = useCallback(async () => {
    onResendEmailClick()
      .then(() => {
        setCountdown(20);
      })
      .catch(() => {
        throw new Error("Something went wrong, Could not send email link ");
      });
  }, [onResendEmailClick]);

  return (
    <div className="rq-auth-card email-verification-card">
      <div className="rq-auth-card-header">
        <IoMdArrowBack onClick={onBackClick} />
        <span>Back</span>
      </div>
      <div className="verify-email-card-body">
        <div className="verify-email-card-content">
          <img src="/assets/media/common/email_spark.svg" alt="email with a spark " />
          <div className="verify-email-card-content__header">Welcome Back!</div>
          <div className="verify-email-card-body__description">
            We just sent a sign in link at <span className="verify-email-card-content__description-email">{email}</span>{" "}
            for you to access your account super quick.
          </div>
        </div>
        <Divider />
        <div className="verify-email-card-body__description text-bold">Didn't receive the email?</div>
      </div>
      <div className="verify-email-card-body__actions">
        <RQButton
          loading={isSendEmailInProgress}
          size="large"
          block
          disabled={countdown > 0}
          onClick={handleResendEmailClick}
        >
          {countdown > 0 ? `Send email again in ${countdown}` : "Send email again"}
        </RQButton>
        {providers.includes(AuthProvider.GOOGLE) ? (
          <>
            <span className="verify-email-card-body__description">Or</span>
            {googleAuthButton}
          </>
        ) : null}
      </div>
    </div>
  );
};
