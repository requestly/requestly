import React, { useCallback } from "react";
import { useGoogleAuthButton } from "features/onboarding/screens/auth/hooks/useGoogleAuthButton";
import { CredentialResponse, FailedLoginCode } from "features/onboarding/screens/auth/types";
import { jwtDecode } from "jwt-decode";
import { toast } from "utils/Toast";
import { handleCustomGoogleSignIn } from "actions/FirebaseActions";

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
  const handleGoogleAuth = useCallback(
    (credentialResponse: CredentialResponse) => {
      if (!credentialResponse) {
        toast.error("Something went wrong. Please try again.");
        return;
      }
      const decodedCredential = jwtDecode(credentialResponse.credential);
      // @ts-ignore
      if (decodedCredential.email !== email) {
        failedLoginCallback(FailedLoginCode.DIFFERENT_USER);
        return;
      }

      handleCustomGoogleSignIn(credentialResponse.credential, successfulLoginCallback, failedLoginCallback);
    },
    [email, failedLoginCallback, successfulLoginCallback]
  );

  useGoogleAuthButton({ callback: handleGoogleAuth });

  return (
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
  );
};
