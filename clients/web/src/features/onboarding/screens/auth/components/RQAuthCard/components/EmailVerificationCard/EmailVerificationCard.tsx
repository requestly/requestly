import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Divider } from "antd";
import { AuthProvider, AuthErrorCode } from "features/onboarding/screens/auth/types";
import { IoMdArrowBack } from "@react-icons/all-files/io/IoMdArrowBack";
import { RQButton } from "lib/design-system-v2/components";
import { GoogleAuthButton } from "../GoogleAuthButton/GoogleAuthButton";
import { useAuthScreenContext } from "features/onboarding/screens/auth/context";
import {
  trackMagicLinkLoginWithGoogleInstead,
  trackMagicLinkResendRequested,
} from "modules/analytics/events/common/auth/emailLinkSignin";
import "./emailVerificationCard.scss";
import { trackLoginSuccessEvent } from "modules/analytics/events/common/auth/login";
import { AUTH_PROVIDERS } from "modules/analytics/constants";
import { LOGGER as Logger } from "@requestly/utils";
import * as Sentry from "@sentry/react";

interface EmailVerificationCardProps {
  onBackClick: () => void;
  onResendEmailClick: () => Promise<void>;
  failedLoginCallback: (code: AuthErrorCode, authProvider: string) => void;
}

export const EmailVerificationCard: React.FC<EmailVerificationCardProps> = ({
  onBackClick,
  onResendEmailClick,
  failedLoginCallback,
}) => {
  const [countdown, setCountdown] = useState(20);
  const { email, authProviders, isSendEmailInProgress, toggleAuthModal, eventSource } = useAuthScreenContext();

  /* Memoized google auth button component because countdown triggers re-render
    which causes google auth button to be re-rendered (causes flicker in button)
  */
  const googleAuthButton = useMemo(() => {
    return (
      <GoogleAuthButton
        type="secondary"
        successfulLoginCallback={() => {
          // @ts-ignore
          trackLoginSuccessEvent({ auth_provider: AUTH_PROVIDERS.GMAIL, source: eventSource });
          toggleAuthModal(false);
        }}
        failedLoginCallback={failedLoginCallback}
        onGoogleAuthClick={() => trackMagicLinkLoginWithGoogleInstead()}
      />
    );
  }, [toggleAuthModal, failedLoginCallback, eventSource]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (countdown > 0) {
        setCountdown(countdown - 1);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [countdown]);

  const handleResendEmailClick = useCallback(async () => {
    trackMagicLinkResendRequested();
    onResendEmailClick()
      .then(() => {
        setCountdown(20);
        Logger.log("[Auth-EmailVerificationCard-handleResendEmailClick] Successfully re-sent email link");
      })
      .catch((error) => {
        Logger.log("[Auth-EmailVerificationCard-handleResendEmailClick] catch", { error });
        Sentry.captureMessage("[Auth] Error sending email link", {
          tags: {
            flow: "auth",
          },
          extra: { email, error, source: "EmailVerificationCard-handleResendEmailClick" },
        });
        throw new Error("Something went wrong, Could not send email link ");
      });
  }, [onResendEmailClick, email]);

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
        {authProviders.includes(AuthProvider.GOOGLE) ? (
          <>
            <span className="verify-email-card-body__description">or</span>
            {googleAuthButton}
          </>
        ) : null}
      </div>
    </div>
  );
};
