import React, { useCallback, useEffect } from "react";
import { RQButton } from "lib/design-system/components";
import { redirectToUrl } from "utils/RedirectionUtils";
import "./signupWithBStackCard.scss";

interface SignupWithBStackCardProps {
  autoRedirect?: boolean;
}

export const SignupWithBStackCard: React.FC<SignupWithBStackCardProps> = ({ autoRedirect = false }) => {
  const handleCreateBStackAccount = useCallback(() => {
    redirectToUrl("https://us-central1-requestly-dev.cloudfunctions.net/oauth/authorize");
  }, []);

  useEffect(() => {
    if (autoRedirect) {
      setTimeout(() => {
        handleCreateBStackAccount();
      }, 5000);
    }
  }, [handleCreateBStackAccount, autoRedirect]);

  return (
    <div className="signup-with-bstack-card">
      <div className="onboarding-card-title text-center">
        {autoRedirect ? "Redirecting you to BrowserStack sign-in page" : "Create your account"}
      </div>
      <div className="signup-with-bstack-card-description">
        {autoRedirect
          ? "It looks like you signed up with BrowserStack. Please use your BrowserStack credentials to sign in."
          : "Requestly is now part of BrowserStack. Please create a new BrowserStack account to continue."}
      </div>
      <RQButton
        block
        size="large"
        icon={<img src="/assets/media/common/browserstack_logo.svg" alt="browserstack logo" />}
        type="primary"
        onClick={handleCreateBStackAccount}
        className={autoRedirect ? "auto-redirect-btn-transition" : ""}
      >
        Create BrowserStack Account
      </RQButton>
      {!autoRedirect ? (
        <div className="bstack-help-link">
          <span>Need help?</span>
        </div>
      ) : null}
    </div>
  );
};
