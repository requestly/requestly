import { RQButton } from "lib/design-system-v2/components";
import loggedOutUser from "/assets/media/common/loggedout-user.svg";
import "./loggedoutPopoverContent.scss";
import { trackLoginButtonClicked } from "modules/analytics/events/common/auth/login";
import { trackSignUpButtonClicked } from "modules/analytics/events/common/auth/signup";
import Link from "antd/lib/typography/Link";
import { getTabServiceActions } from "componentsV2/Tabs/tabUtils";
import { SOURCE } from "modules/analytics/events/common/constants";
import { globalActions } from "store/slices/global/slice";
import { useDispatch } from "react-redux";
import APP_CONSTANTS from "config/constants";

export const LoggedOutPopoverContent = () => {
  const dispatch = useDispatch();

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
        <RQButton
          type="primary"
          onClick={() => {
            handleAuthButtonClick(APP_CONSTANTS.AUTH.ACTION_LABELS.SIGN_UP);
            trackSignUpButtonClicked(SOURCE.NAVBAR);
          }}
        >
          Sign up
        </RQButton>
      </div>
      <div className="logged-out-popover-subtitle">
        Already have an account?{" "}
        <Link
          onClick={() => {
            handleAuthButtonClick(APP_CONSTANTS.AUTH.ACTION_LABELS.LOG_IN);
            trackLoginButtonClicked(SOURCE.NAVBAR);
          }}
        >
          Sign in
        </Link>
      </div>
    </div>
  );
};
