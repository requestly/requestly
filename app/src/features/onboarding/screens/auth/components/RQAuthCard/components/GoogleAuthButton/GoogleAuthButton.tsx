import React, { useCallback, useState } from "react";
import { useGoogleAuthButton } from "features/onboarding/screens/auth/hooks/useGoogleAuthButton";
import { CredentialResponse, FailedLoginCode } from "features/onboarding/screens/auth/types";
import { jwtDecode } from "jwt-decode";
import { toast } from "utils/Toast";
import { handleCustomGoogleSignIn } from "actions/FirebaseActions";
import { Spin } from "antd";
import "./googleAuthButton.scss";

interface GoogleAuthButtonProps {
  email: string;
  successfulLoginCallback: () => void;
  failedLoginCallback: (code: FailedLoginCode) => void;
}

export const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({
  successfulLoginCallback,
  failedLoginCallback,
  email,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const handleGoogleAuth = useCallback(
    (credentialResponse: CredentialResponse) => {
      setIsLoading(true);
      if (!credentialResponse) {
        toast.error("Something went wrong. Please try again.");
        setIsLoading(false);
        return;
      }
      const decodedCredential = jwtDecode(credentialResponse.credential);
      // @ts-ignore
      if (decodedCredential.email !== email) {
        failedLoginCallback(FailedLoginCode.DIFFERENT_USER);
        setIsLoading(false);
        return;
      }

      handleCustomGoogleSignIn(credentialResponse.credential, successfulLoginCallback, failedLoginCallback).finally(
        () => {
          setIsLoading(false);
        }
      );
    },
    [email, failedLoginCallback, successfulLoginCallback]
  );

  useGoogleAuthButton({ callback: handleGoogleAuth });

  return (
    <div className="rq-google-auth-button-container">
      {isLoading ? (
        <div className="rq-google-auth-button-loader-overlay">
          <div className="rq-google-auth-button-loader-overlay__loader">
            <Spin />
          </div>
        </div>
      ) : null}
      <div
        id="rq-google-auth-button"
        className="g_id_signin"
        data-type="standard"
        data-size="large"
        data-theme="outline"
        data-text="continue_with"
        data-shape="rectangular"
        data-logo_alignment="left"
      ></div>
    </div>
  );
};
