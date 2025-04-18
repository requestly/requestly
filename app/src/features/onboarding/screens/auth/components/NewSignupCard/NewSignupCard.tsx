import { Button } from "antd";
import { OnboardingCard } from "features/onboarding/componentsV2/OnboardingCard/OnboardingCard";
import { RQButton } from "lib/design-system-v2/components";
import { useAuthScreenContext } from "../../context";
import { getAppMode } from "store/selectors";
import { useSelector } from "react-redux";
import { redirectToOAuthUrl } from "utils/RedirectionUtils";
import { useNavigate } from "react-router-dom";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import "./newSignupCard.scss";

export const NewSignupCard = () => {
  const navigate = useNavigate();
  const appMode = useSelector(getAppMode);

  const { setIsOnboardingScreenVisible, toggleAuthModal } = useAuthScreenContext();

  const handleCreateNewAccountClick = () => {
    if (appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP) {
      // TODO: Implement desktop app auth
    } else {
      redirectToOAuthUrl(navigate);
    }
  };

  const handleSignInClick = () => {
    if (appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP) {
      // TODO: Implement desktop app auth
    } else {
      setIsOnboardingScreenVisible(false);
    }
  };

  return (
    <OnboardingCard>
      <div className="onboarding-card-title">Create your free account</div>
      <div className="onboarding-card-description">
        You will be redirected to your browser to securely complete the sign-up process in a few simple steps.
      </div>
      <div className="new-signup-card-actions">
        <RQButton size="large" block type="primary" onClick={handleCreateNewAccountClick}>
          Create new account
        </RQButton>
        <RQButton size="large" block onClick={handleSignInClick}>
          Already have an account? Sign in
        </RQButton>
      </div>

      <div className="new-signup-card-footer">
        Use your local Scratch Pad -{" "}
        <Button type="link" size="small" onClick={toggleAuthModal}>
          Continue without an account
        </Button>
      </div>
    </OnboardingCard>
  );
};
