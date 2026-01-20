import { OnboardingCard } from "features/onboarding/componentsV2/OnboardingCard/OnboardingCard";
import { RQButton } from "lib/design-system-v2/components";
import { useAuthScreenContext } from "../../context";
import { getAppMode } from "store/selectors";
import { useDispatch, useSelector } from "react-redux";
import { redirectToOAuthUrl } from "utils/RedirectionUtils";
import { useNavigate } from "react-router-dom";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/constants";
import { globalActions } from "store/slices/global/slice";
import APP_CONSTANTS from "config/constants";
import { trackLoginButtonClicked } from "modules/analytics/events/common/auth/login";
import { SOURCE } from "modules/analytics/events/common/constants";
import "./newSignupCard.scss";
import { trackSignUpButtonClicked } from "modules/analytics/events/common/auth/signup";
import { setRedirectMetadata } from "features/onboarding/utils";

export const NewSignupCard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const appMode = useSelector(getAppMode);

  const { setIsOnboardingScreenVisible, redirectURL } = useAuthScreenContext();
  const isDesktopApp = appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP;

  const handleAuthButtonClick = (authMode: string) => {
    dispatch(
      globalActions.toggleActiveModal({
        modalName: "authModal",
        newValue: true,
        newProps: {
          redirectURL,
          authMode,
          eventSource: isDesktopApp ? SOURCE.DESKTOP_ONBOARDING : SOURCE.EXTENSION_ONBOARDING,
        },
      })
    );
  };

  const handleCreateNewAccountClick = () => {
    if (appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP) {
      trackSignUpButtonClicked(SOURCE.DESKTOP_ONBOARDING);
      handleAuthButtonClick(APP_CONSTANTS.AUTH.ACTION_LABELS.SIGN_UP);
    } else {
      trackSignUpButtonClicked(SOURCE.EXTENSION_ONBOARDING);
      setRedirectMetadata({ source: SOURCE.EXTENSION_ONBOARDING, redirectURL });
      redirectToOAuthUrl(navigate);
    }
  };

  const handleSignInClick = () => {
    if (appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP) {
      trackLoginButtonClicked(SOURCE.DESKTOP_ONBOARDING);
      handleAuthButtonClick(APP_CONSTANTS.AUTH.ACTION_LABELS.LOG_IN);
    } else {
      trackLoginButtonClicked(SOURCE.EXTENSION_ONBOARDING);
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
    </OnboardingCard>
  );
};
