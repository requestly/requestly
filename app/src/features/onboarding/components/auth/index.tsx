import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getUserAuthDetails } from "store/selectors";
import { AuthForm } from "./components/form";
import { OnboardingAuthBanner } from "./components/banner";
import AUTH from "config/constants/sub/auth";
import MagicLinkModalContent from "components/authentication/AuthForm/MagicAuthLinkModal/MagicLinkModalContent";
import { ONBOARDING_STEPS } from "features/onboarding/types";
import { sendEmailLinkForSignin } from "actions/FirebaseActions";
import { updateTimeToResendEmailLogin } from "components/authentication/AuthForm/MagicAuthLinkModal/actions";
import { actions } from "store";
import Logger from "lib/logger";
import { BiArrowBack } from "@react-icons/all-files/bi/BiArrowBack";
import "./index.scss";

export const OnboardingAuthScreen: React.FC = () => {
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const [authMode, setAuthMode] = useState(AUTH.ACTION_LABELS.SIGN_UP);
  const [email, setEmail] = useState("");
  const [isVerifyEmailPopupVisible, setIsVerifyEmailPopupVisible] = useState(false);

  const handleSendEmailLink = (email: string) => {
    if (email) {
      setEmail(email);
      sendEmailLinkForSignin(email, "app_onboarding")
        .then(() => {
          updateTimeToResendEmailLogin(dispatch, 30);
          setIsVerifyEmailPopupVisible(true);
        })
        .catch((error) => {
          Logger.log(error);
        });
    }
  };

  useEffect(() => {
    if (user.loggedIn) {
      dispatch(actions.updateAppOnboardingStep(ONBOARDING_STEPS.PERSONA));
    }
  }, [dispatch, user.loggedIn]);

  return (
    <div className="onboarding-auth-screen-wrapper">
      {email && isVerifyEmailPopupVisible ? (
        <div className="verify-email-wrapper">
          <button
            className="verify-email-back-btn"
            onClick={() => {
              setEmail("");
              setIsVerifyEmailPopupVisible(false);
            }}
          >
            <BiArrowBack />
            <span>Back</span>
          </button>
          <MagicLinkModalContent email={email} authMode={authMode} eventSource="app_onboarding" />
        </div>
      ) : (
        <div className={`onboarding-auth-screen ${authMode === AUTH.ACTION_LABELS.SIGN_UP ? "w-full" : ""}`}>
          <div className="onboarding-auth-form-wrapper">
            <AuthForm authMode={authMode} setAuthMode={setAuthMode} onSendEmailLink={handleSendEmailLink} />
          </div>
          {authMode === AUTH.ACTION_LABELS.SIGN_UP && (
            <div className="onboarding-auth-banner-wrapper">
              <OnboardingAuthBanner />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
