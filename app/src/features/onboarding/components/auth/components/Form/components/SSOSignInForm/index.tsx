import React, { useCallback, useMemo, useState } from "react";
import { BiArrowBack } from "@react-icons/all-files/bi/BiArrowBack";
import { AuthFormInput } from "../AuthFormInput";
import { RQButton } from "lib/design-system/components";
import APP_CONSTANTS from "config/constants";
import { getFunctions, httpsCallable } from "firebase/functions";
import Logger from "lib/logger";
import { MdOutlineWarningAmber } from "@react-icons/all-files/md/MdOutlineWarningAmber";
import { getDomainFromEmail, isEmailValid } from "utils/FormattingHelper";
import { toast } from "utils/Toast";
import { trackLoginAttemptedEvent, trackLoginFailedEvent } from "modules/analytics/events/common/auth/login";
import { AUTH_PROVIDERS } from "modules/analytics/constants";
import { getSSOProviderId } from "backend/auth/sso";
import { loginWithSSO } from "actions/FirebaseActions";
import { EmailType } from "@requestly/shared/types/common";
import { getEmailType } from "utils/mailCheckerUtils";
import "./index.scss";

interface Props {
  email: string;
  setAuthMode: (authMode: string) => void;
  setEmail: (userEmail: string) => void;
  source: string;
}

export const SSOSignInForm: React.FC<Props> = ({ setAuthMode, email, setEmail, source }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isNoConnectionFoundCardVisible, setIsNoConnectionFoundCardVisible] = useState(false);

  const domain = useMemo(() => getDomainFromEmail(email), [email]);

  const handleLoginWithSSO = useCallback(async () => {
    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    if (!isEmailValid(email)) {
      toast.error("Please enter a valid email");
      return;
    }

    const emailType = await getEmailType(email);
    if (emailType === EmailType.DESTROYABLE) {
      toast.error("Please enter a valid email address. Temporary or disposable email addresses are not allowed.");
      return;
    }

    trackLoginAttemptedEvent({
      auth_provider: AUTH_PROVIDERS.SSO,
      email,
      place: window.location.href,
      email_type: emailType,
      domain: domain,
      source,
    });

    setIsLoading(true);

    const providerId = await getSSOProviderId(email);
    setIsNoConnectionFoundCardVisible(false);

    if (providerId) {
      await loginWithSSO(providerId, email);
    } else {
      setIsNoConnectionFoundCardVisible(true);
      trackLoginFailedEvent({
        auth_provider: AUTH_PROVIDERS.SSO,
        email,
        place: window.location.href,
        source,
        error_message: "SSO connection not found",
      });
      const captureSSOInterest = httpsCallable(getFunctions(), "auth-captureSSOInterest");

      captureSSOInterest({ email, isCompanyEmail: emailType === EmailType.BUSINESS })
        .then(() => {
          Logger.log("SSO interest captured successfully");
        })
        .catch((error) => {
          Logger.log("Error capturing SSO interest", error);
        });
    }
    setIsLoading(false);
  }, [domain, email, source]);

  return (
    <>
      <button
        className="auth-screen-back-btn sso-screen-back-btn"
        onClick={() => {
          setAuthMode(APP_CONSTANTS.AUTH.ACTION_LABELS.SIGN_UP);
        }}
      >
        <BiArrowBack />
        <span>Back</span>
      </button>
      {isNoConnectionFoundCardVisible && (
        <div className="sso-not-found-card">
          <MdOutlineWarningAmber className="sso-not-found-card-icon" />
          <div>
            <div className="text-bold sso-not-found-card-header">Unknown SSO connection for {domain}</div>
            <div className="sso-not-found-card-text">
              Don't have Requestly enterprise plan yet? Contact us at{" "}
              <a className="sso-not-found-card-link" href="mailto:sales@requestly.io">
                sales@requestly.io
              </a>{" "}
              to know more.
            </div>
          </div>
        </div>
      )}
      <div className="text-bold text-white header mt-16">Sign in with SSO</div>
      <div className="mt-24">
        <AuthFormInput
          id="email"
          value={email}
          onValueChange={(email) => {
            setEmail(email);
            setIsNoConnectionFoundCardVisible(false);
          }}
          placeholder="E.g., you@company.com"
          label="Your work email"
          onPressEnter={handleLoginWithSSO}
          type="email"
        />
      </div>
      <RQButton
        block
        size="large"
        type="primary"
        className="sso-screen-continue-btn mt-16"
        loading={isLoading}
        onClick={handleLoginWithSSO}
      >
        Continue
      </RQButton>
      <div className="sso-form-footer">You will be redirected to your organization's Single Sign-on portal.</div>
    </>
  );
};
