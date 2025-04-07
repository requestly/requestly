import React, { useState } from "react";
import { RQButton } from "lib/design-system-v2/components";
import { AuthFormInput } from "../RQAuthCard/components/AuthFormInput/AuthFormInput";
import { getFunctions, httpsCallable } from "firebase/functions";
import { toast } from "utils/Toast";
import { AuthSyncMetadata } from "../../types";

interface EnterEmailCardProps {
  email: string;
  onEmailChange: (email: string) => void;
  onAuthSyncVerification: (metadata: any) => void;
}

export const EnterEmailCard: React.FC<EnterEmailCardProps> = ({ email, onEmailChange, onAuthSyncVerification }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleOnContinue = async () => {
    setIsLoading(true);
    // TODO: rename function
    const getUserAuthSyncDetails = httpsCallable(getFunctions(), "users-getAuthSyncData");
    getUserAuthSyncDetails({ email })
      .then(({ data }: { data: AuthSyncMetadata }) => {
        if (data.success) {
          const metadata = data.syncData;
          onAuthSyncVerification(metadata);
          return;
        }
        toast.error("Something went wrong! Please try again later or contact support.");
      })
      .catch((err) => {
        toast.error("Something went wrong! Please try again later or contact support.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <div className="enter-email-card">
      <div className="onboarding-card-title">Sign in to your account</div>
      <div style={{ marginTop: "16px" }}>
        <AuthFormInput
          placeholder="example@work.com"
          label="Your work email"
          autoFocus
          value={email}
          onValueChange={onEmailChange}
          onPressEnter={handleOnContinue}
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
    </div>
  );
};
