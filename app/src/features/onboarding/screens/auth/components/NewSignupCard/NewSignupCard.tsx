import { Button } from "antd";
import { OnboardingCard } from "features/onboarding/componentsV2/OnboardingCard/OnboardingCard";
import { RQButton } from "lib/design-system-v2/components";
import { useAuthScreenContext } from "../../context";
import { getAppMode } from "store/selectors";
import { useDispatch, useSelector } from "react-redux";
import { redirectToOAuthUrl } from "utils/RedirectionUtils";
import { useNavigate } from "react-router-dom";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import { globalActions } from "store/slices/global/slice";
import APP_CONSTANTS from "config/constants";
import "./newSignupCard.scss";

export const NewSignupCard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const appMode = useSelector(getAppMode);

  const { setIsOnboardingScreenVisible, toggleAuthModal } = useAuthScreenContext();

  const handleAuthButtonClick = (authMode: string) => {
    dispatch(
      globalActions.toggleActiveModal({
        modalName: "authModal",
        newValue: true,
        newProps: {
          redirectURL: window.location.href,
          authMode,
          eventSource: "new_sign_up_card", // TODO: @parth update the event source
        },
      })
    );
  };

  const handleCreateNewAccountClick = () => {
    if (appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP) {
      handleAuthButtonClick(APP_CONSTANTS.AUTH.ACTION_LABELS.SIGN_UP);
    } else {
      redirectToOAuthUrl(navigate);
    }
  };

  const handleSignInClick = () => {
    if (appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP) {
      handleAuthButtonClick(APP_CONSTANTS.AUTH.ACTION_LABELS.LOG_IN);
    } else {
      setIsOnboardingScreenVisible(false);
    }
  };

  return (
    <OnboardingCard>
      <div className="onboarding-card-title">Create your free account</div>
      {appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP ? (
        <div className="onboarding-card-description">
          You will be redirected to your browser to securely complete the sign-up process in a few simple steps.
        </div>
      ) : null}
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
        <Button
          type="link"
          size="small"
          onClick={() => {
            dispatch(globalActions.updateIsOnboardingCompleted(true));
            toggleAuthModal(false);
          }}
        >
          Continue without an account
        </Button>
      </div>
    </OnboardingCard>
  );
};
