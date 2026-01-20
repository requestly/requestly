import React from "react";
import { IoMdArrowBack } from "@react-icons/all-files/io/IoMdArrowBack";
import { RQButton } from "lib/design-system-v2/components";
import LINKS from "config/constants/sub/links";
import { useDispatch, useSelector } from "react-redux";
import { globalActions } from "store/slices/global/slice";
import { getAppMode } from "store/selectors";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/constants";
import { SOURCE } from "modules/analytics/events/common/constants";
import APP_CONSTANTS from "config/constants";
import "./authCard.scss";

interface Props {
  onBackClick: () => void;
}

export const AuthCard: React.FC<Props> = ({ onBackClick }) => {
  const dispatch = useDispatch();
  const appMode = useSelector(getAppMode);

  const handleAuthButtonClick = (authMode: string) => {
    dispatch(
      globalActions.toggleActiveModal({
        modalName: "authModal",
        newValue: true,
        newProps: {
          authMode,
          eventSource:
            appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP ? SOURCE.DESKTOP_ONBOARDING : SOURCE.EXTENSION_ONBOARDING,
        },
      })
    );
  };
  return (
    <>
      <div className="auth-card-header">
        <IoMdArrowBack onClick={onBackClick} />
        Create your free account
      </div>

      <div className="auth-card-description">
        You will be redirected to your browser to securely complete the sign-up process in a few simple steps.
      </div>
      <div className="auth-card-actions">
        <RQButton
          type="primary"
          block
          size="large"
          onClick={() => handleAuthButtonClick(APP_CONSTANTS.AUTH.ACTION_LABELS.SIGN_UP)}
        >
          Create new account
        </RQButton>
        <RQButton block size="large" onClick={() => handleAuthButtonClick(APP_CONSTANTS.AUTH.ACTION_LABELS.LOG_IN)}>
          Already have an account? Sign in
        </RQButton>
      </div>

      <div className="auth-card-footer">
        By signing in, you agree to our{" "}
        <a href={LINKS.REQUESTLY_TERMS_AND_CONDITIONS} target="_blank" rel="noreferrer">
          Terms
        </a>{" "}
        and{" "}
        <a href={LINKS.REQUESTLY_PRIVACY_POLICY} target="_blank" rel="noreferrer">
          Privacy statement
        </a>
      </div>
    </>
  );
};
