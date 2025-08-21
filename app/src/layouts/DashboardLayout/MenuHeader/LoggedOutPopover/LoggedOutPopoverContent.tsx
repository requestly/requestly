import { RQButton } from "lib/design-system-v2/components";
import loggedOutUser from "/assets/media/common/loggedout-user.svg";
import "./loggedoutPopoverContent.scss";
import { trackLoginButtonClicked } from "modules/analytics/events/common/auth/login";
import { trackSignUpButtonClicked } from "modules/analytics/events/common/auth/signup";
import Link from "antd/lib/typography/Link";
import { getTabServiceActions } from "componentsV2/Tabs/tabUtils";
import { SOURCE } from "modules/analytics/events/common/constants";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import { useIsBrowserStackIntegrationOn } from "hooks/useIsBrowserStackIntegrationOn";
import { globalActions } from "store/slices/global/slice";
import { useDispatch, useSelector } from "react-redux";
import { getAppMode } from "store/selectors";
import APP_CONSTANTS from "config/constants";
import { setRedirectMetadata } from "features/onboarding/utils";
import { redirectToOAuthUrl } from "utils/RedirectionUtils";
import { useNavigate } from "react-router-dom";

export const LoggedOutPopoverContent = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const appMode = useSelector(getAppMode);

  const isBrowserstackIntegrationOn = useIsBrowserStackIntegrationOn();

  const handleAuthButtonClick = (authMode: string) => {
    getTabServiceActions().resetTabs(true);
    dispatch(
      globalActions.toggleActiveModal({
        modalName: "authModal",
        newValue: true,
        newProps: {
          authMode,
          redirectURL: window.location.href,
          eventSource: SOURCE.NAVBAR,
        },
      })
    );
  };

  const handleSignupClick = () => {
    getTabServiceActions().resetTabs(true);
    trackSignUpButtonClicked(SOURCE.NAVBAR);
    if (appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP) {
      handleAuthButtonClick(APP_CONSTANTS.AUTH.ACTION_LABELS.SIGN_UP);
      return;
    }

    if (isBrowserstackIntegrationOn) {
      setRedirectMetadata({ source: SOURCE.NAVBAR, redirectURL: window.location.href });
      redirectToOAuthUrl(navigate);
      return;
    } else {
      handleAuthButtonClick(APP_CONSTANTS.AUTH.ACTION_LABELS.SIGN_UP);
    }
  };

  return (
    <div className="logged-out-popover-container">
      <div className="logged-out-popover-icon">
        <img src={loggedOutUser} height={32} width={32} alt="nudge-icon" className="nudge-prompt-icon" />
      </div>
      <div className="logged-out-popover-content">
        Sign up is completely optional. You can signup to access admin controls, experimental features, and your
        org-level settings.
      </div>
      <div className="logged-out-popover-button">
        <RQButton type="primary" onClick={handleSignupClick}>
          Sign up
        </RQButton>
      </div>
      <div className="logged-out-popover-subtitle">
        Already have an account?{" "}
        <Link
          onClick={() => {
            trackLoginButtonClicked(SOURCE.NAVBAR);
            handleAuthButtonClick(APP_CONSTANTS.AUTH.ACTION_LABELS.LOG_IN);
          }}
        >
          Sign in
        </Link>
      </div>
    </div>
  );
};
