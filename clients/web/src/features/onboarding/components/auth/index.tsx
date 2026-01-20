import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { AuthForm } from "./components/Form";
import { OnboardingAuthBanner } from "./components/Banner";
import AUTH from "config/constants/sub/auth";
import MagicLinkModalContent from "components/authentication/AuthForm/MagicAuthLinkModal/MagicLinkModalContent";
import { ONBOARDING_STEPS } from "features/onboarding/types";
import { globalActions } from "store/slices/global/slice";
import { BiArrowBack } from "@react-icons/all-files/bi/BiArrowBack";
import { trackAppOnboardingStepCompleted, trackAppOnboardingViewed } from "features/onboarding/analytics";
import { m } from "framer-motion";
import APP_CONSTANTS from "config/constants";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/constants";
import { useFeatureValue } from "@growthbook/growthbook-react";
import { CompaniesLogoBanner } from "./components/CompaniesLogoBanner";
import { getAppFlavour } from "utils/AppUtils";
import "./index.scss";

interface Props {
  isOpen: boolean;
  toggleAuthModal?: () => void;
  defaultAuthMode: string;
  warningMessage?: string;
  isOnboarding?: boolean;
  source: string;
  callback?: () => void;
}

export const AuthScreen: React.FC<Props> = ({
  isOpen,
  toggleAuthModal = () => {},
  defaultAuthMode = APP_CONSTANTS.AUTH.ACTION_LABELS.SIGN_UP,
  warningMessage,
  isOnboarding = false,
  source,
  callback = () => {},
}) => {
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const [authMode, setAuthMode] = useState(defaultAuthMode);
  const [email, setEmail] = useState("");
  const [isVerifyEmailPopupVisible, setIsVerifyEmailPopupVisible] = useState(false);
  const onboardingVariation = useFeatureValue("onboarding_activation_v2", "variant1");
  const appFlavour = getAppFlavour();

  useEffect(() => {
    if (isOpen && isOnboarding) {
      trackAppOnboardingViewed(ONBOARDING_STEPS.AUTH);
    }
  }, [isOpen, isOnboarding]);

  useEffect(() => {
    if (user.loggedIn && isOnboarding) {
      dispatch(globalActions.updateAppOnboardingStep(ONBOARDING_STEPS.PERSONA));
      trackAppOnboardingStepCompleted(ONBOARDING_STEPS.AUTH);
    }
  }, [user.loggedIn, dispatch, isOnboarding]);

  return (
    <div className={`onboarding-auth-screen-wrapper ${onboardingVariation === "variant3" ? "variant3" : ""}`}>
      {email && isVerifyEmailPopupVisible ? (
        <div className="verify-email-wrapper">
          <button
            className="auth-screen-back-btn"
            onClick={() => {
              dispatch(globalActions.updateIsAppOnboardingStepDisabled(false));
              setIsVerifyEmailPopupVisible(false);
            }}
          >
            <BiArrowBack />
            <span>Back</span>
          </button>
          <MagicLinkModalContent email={email} authMode={authMode} eventSource={source} />
        </div>
      ) : onboardingVariation === "variant3" ? (
        <>
          <m.div
            transition={{ type: "linear" }}
            layout
            className={`onboarding-auth-screen  variant3 ${
              authMode === AUTH.ACTION_LABELS.SIGN_UP && onboardingVariation !== "variant3" ? "w-full" : ""
            }`}
          >
            {!isOnboarding ? (
              <img src={"/assets/media/common/rq_logo_full.svg"} alt="Requestly logo" style={{ width: "133px" }} />
            ) : null}
            <m.div transition={{ type: "linear" }} layout className="onboarding-auth-form-wrapper">
              <AuthForm
                authMode={authMode}
                setAuthMode={setAuthMode}
                email={email}
                setEmail={setEmail}
                isOnboarding={isOnboarding}
                source={source}
                callback={callback}
                setIsVerifyEmailPopupVisible={setIsVerifyEmailPopupVisible}
                toggleModal={toggleAuthModal}
                warningMessage={warningMessage}
              />
            </m.div>
            {authMode === AUTH.ACTION_LABELS.SIGN_UP && appFlavour === GLOBAL_CONSTANTS.APP_FLAVOURS.REQUESTLY && (
              <m.div transition={{ type: "linear" }} layout className="companies-logo-banner">
                <CompaniesLogoBanner />
              </m.div>
            )}
          </m.div>
        </>
      ) : (
        <m.div
          transition={{ type: "linear" }}
          layout
          className={`onboarding-auth-screen ${authMode === AUTH.ACTION_LABELS.SIGN_UP ? "w-full" : ""}`}
        >
          <m.div transition={{ type: "linear" }} layout className="onboarding-auth-form-wrapper">
            <AuthForm
              authMode={authMode}
              setAuthMode={setAuthMode}
              email={email}
              setEmail={setEmail}
              isOnboarding={isOnboarding}
              source={source}
              callback={callback}
              setIsVerifyEmailPopupVisible={setIsVerifyEmailPopupVisible}
              toggleModal={toggleAuthModal}
              warningMessage={warningMessage}
            />
          </m.div>
          {authMode === AUTH.ACTION_LABELS.SIGN_UP && (
            <m.div transition={{ type: "linear" }} layout className="onboarding-auth-banner-wrapper">
              <OnboardingAuthBanner />
            </m.div>
          )}
        </m.div>
      )}
    </div>
  );
};
