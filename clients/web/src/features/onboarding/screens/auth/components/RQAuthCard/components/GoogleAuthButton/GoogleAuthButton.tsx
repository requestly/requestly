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
import { AUTH_PROVIDERS } from "modules/analytics/constants";
import { LOGGER as Logger } from "@requestly/utils";
import * as Sentry from "@sentry/react";

interface GoogleAuthButtonProps {
  onGoogleAuthClick?: () => void;
  successfulLoginCallback: (authProvider: string) => void;
  failedLoginCallback: (code: AuthErrorCode, authProvider?: string) => void;
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

  const onSuccess = useCallback(() => {
    successfulLoginCallback(AUTH_PROVIDERS.GMAIL);
    Logger.log("[Auth-GoogleAuthButton-onSuccess] Successfully logged in with Google");
  }, [successfulLoginCallback]);

  const onFail = useCallback(
    (code: AuthErrorCode) => {
      Logger.log("[Auth-GoogleAuthButton-onFail] Error logging in with Google", { code });
      Sentry.captureMessage("[Auth] Error logging in with Google", {
        tags: {
          flow: "auth",
        },
        extra: { email, code, source: "GoogleAuthButton-onFail" },
      });
      failedLoginCallback(code, AUTH_PROVIDERS.GMAIL);
    },
    [failedLoginCallback, email]
  );

  const handleGoogleAuth = useCallback(
    (credentialResponse: CredentialResponse) => {
      trackLoginWithGoogleClicked();
      setIsLoading(true);
      onGoogleAuthClick();
      if (!credentialResponse) {
        Logger.log("[Auth-GoogleAuthButton-handleGoogleAuth] No credential response");
        Sentry.captureMessage("[Auth] No credential response in Google auth", {
          tags: {
            flow: "auth",
          },
          extra: { email, code: AuthErrorCode.NONE, source: "GoogleAuthButton-handleGoogleAuth" },
        });
        toast.error("Something went wrong. Please try again.");
        setIsLoading(false);
        return;
      }
      const decodedCredential = jwtDecode(credentialResponse.credential);
      // @ts-ignore
      if (decodedCredential.email !== email) {
        onFail(AuthErrorCode.DIFFERENT_USER);
        Logger.log("[Auth-GoogleAuthButton-handleGoogleAuth] Different user");
        Sentry.captureMessage("[Auth] Different user auth detected with Google", {
          tags: {
            flow: "auth",
          },
          extra: { email, code: AuthErrorCode.DIFFERENT_USER, source: "GoogleAuthButton-handleGoogleAuth" },
        });
        setIsLoading(false);
        return;
      }

      handleCustomGoogleSignIn(credentialResponse.credential, onSuccess, onFail).finally(() => {
        setIsLoading(false);
      });
    },
    [email, onGoogleAuthClick, onFail, onSuccess]
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
