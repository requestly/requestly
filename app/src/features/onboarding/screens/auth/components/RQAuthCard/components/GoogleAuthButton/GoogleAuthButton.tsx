import React, { useCallback, useState } from "react";
import { useGoogleAuthButton } from "features/onboarding/screens/auth/hooks/useGoogleAuthButton";
import { CredentialResponse, AuthErrorCode } from "features/onboarding/screens/auth/types";
import { jwtDecode } from "jwt-decode";
import { toast } from "utils/Toast";
import { handleCustomGoogleSignIn } from "actions/FirebaseActions";
import { Spin } from "antd";
import { useAuthScreenContext } from "features/onboarding/screens/auth/context";
import { trackLoginWithGoogleClicked } from "modules/analytics/events/common/auth/signup";
import "./googleAuthButton.scss";

interface GoogleAuthButtonProps {
  onGoogleAuthClick?: () => void;
  successfulLoginCallback: () => void;
  failedLoginCallback: (code: AuthErrorCode) => void;
  type: "primary" | "secondary";
}

export const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({
  successfulLoginCallback,
  failedLoginCallback,
  type,
  onGoogleAuthClick = () => {},
}) => {
  const { email } = useAuthScreenContext();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleAuth = useCallback(
    (credentialResponse: CredentialResponse) => {
      trackLoginWithGoogleClicked();
      setIsLoading(true);
      onGoogleAuthClick();
      if (!credentialResponse) {
        toast.error("Something went wrong. Please try again.");
        setIsLoading(false);
        return;
      }
      const decodedCredential = jwtDecode(credentialResponse.credential);
      // @ts-ignore
      if (decodedCredential.email !== email) {
        failedLoginCallback(AuthErrorCode.DIFFERENT_USER);
        setIsLoading(false);
        return;
      }

      handleCustomGoogleSignIn(credentialResponse.credential, successfulLoginCallback, failedLoginCallback).finally(
        () => {
          setIsLoading(false);
        }
      );
    },
    [email, failedLoginCallback, onGoogleAuthClick, successfulLoginCallback]
  );

  useGoogleAuthButton({ callback: handleGoogleAuth, type });

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
