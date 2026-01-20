import React, { useEffect, useState } from "react";
import { RQButton } from "lib/design-system-v2/components";
import { AuthFormInput } from "../RQAuthCard/components/AuthFormInput/AuthFormInput";
import { getFunctions, httpsCallable } from "firebase/functions";
import { toast } from "utils/Toast";
import { AuthSyncMetadata } from "../../types";
import { isEmailValid } from "utils/FormattingHelper";
import { useAuthScreenContext } from "../../context";
import LINKS from "config/constants/sub/links";
import { trackAuthModalShownEvent } from "modules/analytics/events/common/auth/authModal";
import { trackLoginEmailEntered } from "modules/analytics/events/common/auth/signup";
import { LOGGER as Logger } from "@requestly/utils";
import * as Sentry from "@sentry/react";

interface EnterEmailCardProps {
  onEmailChange: (email: string) => void;
  onAuthSyncVerification: (metadata: any) => void;
}

export const EnterEmailCard: React.FC<EnterEmailCardProps> = ({ onEmailChange, onAuthSyncVerification }) => {
  const { email, isOnboarding, eventSource } = useAuthScreenContext();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOnboarding) {
      trackAuthModalShownEvent(eventSource, "login");
    }
  }, [isOnboarding, eventSource]);

  const handleOnContinue = async () => {
    trackLoginEmailEntered();
    setIsLoading(true);
    const processedEmail = email.trim();

    if (!isEmailValid(processedEmail)) {
      Logger.log("[Auth-handleOnContinue] Invalid email");
      Sentry.captureMessage("[Auth] Invalid email address", {
        tags: {
          flow: "auth",
        },
        extra: { email, source: "EnterEmailCard-handleOnContinue" },
      });
      toast.error("Please enter a valid email address");
      setIsLoading(false);
      return;
    }

    const getUserAuthSyncDetails = httpsCallable(getFunctions(), "users-getAuthSyncData");
    try {
      getUserAuthSyncDetails({ email: processedEmail }).then(({ data }: { data: AuthSyncMetadata }) => {
        if (data.success) {
          const metadata = data.syncData;
          onAuthSyncVerification(metadata);
          Logger.log("[Auth-handleOnContinue] metadata", { metadata });
          Sentry.captureMessage("[Auth] User auth sync details fetched successfully", {
            tags: {
              flow: "auth",
            },
            extra: { email, metadata, source: "EnterEmailCard-handleOnContinue" },
          });
          return;
        }
        Logger.log("[Auth-handleOnContinue] Error getting user auth sync details", { data });
        Sentry.captureMessage("[Auth] Error getting user auth sync details", {
          tags: {
            flow: "auth",
          },
          extra: { email, data, source: "EnterEmailCard-handleOnContinue" },
        });
        toast.error("Something went wrong! Please try again or contact support.");
        setIsLoading(false);
      });
    } catch (error) {
      Logger.log("[Auth-handleOnContinue] catch", { error });
      Sentry.captureMessage("[Auth] Error getting user auth sync details", {
        tags: {
          flow: "auth",
        },
        extra: { error, source: "EnterEmailCard-handleOnContinue" },
      });
      toast.error("Something went wrong! Please try again or contact support.");
      setIsLoading(false);
    }
  };

  return (
    <div className="enter-email-card">
      <div className="onboarding-card-title">Sign in to your account</div>
      <div style={{ marginTop: "16px" }}>
        <AuthFormInput
          placeholder="name@company.com"
          label="Your work email"
          autoFocus
          value={email}
          onValueChange={onEmailChange}
          onPressEnter={handleOnContinue}
          type="email"
        />
      </div>
      <RQButton
        loading={isLoading}
        disabled={!email}
        size="large"
        type="primary"
        block
        style={{ marginTop: "16px" }}
        onClick={handleOnContinue}
      >
        Continue
      </RQButton>
      <div className="enter-email-card-footer">
        By signing in, you agree to our{" "}
        <a href={LINKS.REQUESTLY_TERMS_AND_CONDITIONS} target="_blank" rel="noreferrer">
          Terms
        </a>{" "}
        and{" "}
        <a href={LINKS.REQUESTLY_PRIVACY_STATEMENT} target="_blank" rel="noreferrer">
          Privacy statement
        </a>
      </div>
    </div>
  );
};
