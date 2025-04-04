import React, { useCallback } from "react";
import { useGoogleAuthButton } from "features/onboarding/screens/auth/hooks/useGoogleAuthButton";
import { CredentialResponse, FailedLoginCode } from "features/onboarding/screens/auth/types";
import { jwtDecode } from "jwt-decode";
import { toast } from "utils/Toast";
import { getAuth, signInWithCustomToken } from "firebase/auth";
import firebaseApp from "firebase";

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
      const auth = getAuth(firebaseApp);
      signInWithCustomToken(auth, credentialResponse.credential)
        .then((result) => {
          toast.success(`Welcome back ${result.user.displayName}`);
          successfulLoginCallback();
        })
        .catch(() => {
          toast.error("Something went wrong. Please try again.");
          failedLoginCallback(FailedLoginCode.UNKNOWN);
        });
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
