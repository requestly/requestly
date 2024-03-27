import React, { useCallback, useState } from "react";
import { BiArrowBack } from "@react-icons/all-files/bi/BiArrowBack";
import { AuthFormInput } from "../AuthFormInput";
import { RQButton } from "lib/design-system/components";
import APP_CONSTANTS from "config/constants";
import { getFunctions, httpsCallable } from "firebase/functions";
import Logger from "lib/logger";
import { MdOutlineWarningAmber } from "@react-icons/all-files/md/MdOutlineWarningAmber";
import { getDomainFromEmail, isEmailValid } from "utils/FormattingHelper";
import { toast } from "utils/Toast";
import "./index.scss";

interface Props {
  email: string;
  setAuthMode: (authMode: string) => void;
  setEmail: (userEmail: string) => void;
}

export const SSOSignInForm: React.FC<Props> = ({ setAuthMode, email, setEmail }) => {
  const [isloading, setIsLoading] = useState(false);
  const [isNoConnectionFoundCardVisible, setIsNoConnectionFoundCardVisible] = useState(false);
  const domain = getDomainFromEmail(email);

  const handleCaptureSSOInterest = useCallback(() => {
    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    if (!isEmailValid(email)) {
      toast.error("Please enter a valid email");
      return;
    }

    setIsLoading(true);
    const captureSSOInterest = httpsCallable(getFunctions(), "auth-captureSSOInterest");

    captureSSOInterest({ email })
      .then(() => {
        Logger.log("SSO interest captured successfully");
      })
      .catch((error) => {
        Logger.log("Error capturing SSO interest", error);
      })
      .finally(() => {
        setIsLoading(false);
        setIsNoConnectionFoundCardVisible(true);
      });
  }, [email]);

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
              Don’t have Requestly enterprise plan yet? Contact us at{" "}
              <a className="sso-not-found-card-link" href="mailto:sales@requestly.io">
                sales@requestly.io
              </a>{" "}
              to know more.
            </div>
          </div>
        </div>
      )}
      <div className="text-bold text-white header mt-24">Sign in with SSO</div>
      <div className="mt-24">
        <AuthFormInput
          id="email"
          value={email}
          onValueChange={(email) => setEmail(email)}
          placeholder="E.g., you@company.com"
          label="Your work email"
          onPressEnter={handleCaptureSSOInterest}
        />
      </div>
      <RQButton
        block
        size="large"
        type="primary"
        className="sso-screen-continue-btn mt-16"
        loading={isloading}
        onClick={handleCaptureSSOInterest}
      >
        Continue
      </RQButton>
    </>
  );
};
