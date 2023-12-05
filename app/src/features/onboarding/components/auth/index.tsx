import React, { useState } from "react";
import { AuthForm } from "./components/Form";
import { OnboardingAuthBanner } from "./components/Banner";
import { AUTH_MODE } from "features/onboarding/types";
import { m, AnimatePresence } from "framer-motion";
import "./index.scss";

export const OnboardingAuthScreen: React.FC = () => {
  const [authMode, setAuthMode] = useState<AUTH_MODE>(AUTH_MODE.SIGNUP);

  return (
    <div className="onboarding-auth-screen-wrapper">
      <m.div
        className="onboarding-auth-screen"
        initial={{ width: "auto" }}
        animate={{ width: authMode === AUTH_MODE.SIGNUP ? "100%" : "440px" }}
        transition={{ delay: authMode === AUTH_MODE.SIGNUP ? 0 : 0.2 }}
      >
        <div className="onboarding-auth-form-wrapper">
          <AuthForm authMode={authMode} setAuthMode={setAuthMode} />
        </div>
        <AnimatePresence>
          {authMode == AUTH_MODE.SIGNUP && (
            <m.div
              className="onboarding-auth-banner-wrapper"
              exit={{ opacity: 0 }}
              initial={{ opacity: 0, width: "100%" }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.1, delay: authMode === AUTH_MODE.SIGNUP ? 0.1 : 0 }}
            >
              <OnboardingAuthBanner />
            </m.div>
          )}
        </AnimatePresence>
      </m.div>
    </div>
  );
};
