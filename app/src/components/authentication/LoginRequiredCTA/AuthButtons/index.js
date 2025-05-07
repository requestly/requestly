import React from "react";
import { useDispatch } from "react-redux";
import { Space } from "antd";
import APP_CONSTANTS from "../../../../config/constants";
import { globalActions } from "store/slices/global/slice";
import { useNavigate } from "react-router-dom";
import PATHS from "config/constants/sub/paths";
import { RQButton } from "lib/design-system-v2/components";
import { trackSignUpButtonClicked } from "modules/analytics/events/common/auth/signup";
import { trackLoginButtonClicked } from "modules/analytics/events/common/auth/login";

const { ACTION_LABELS: AUTH_ACTION_LABELS } = APP_CONSTANTS.AUTH;

const AuthButtons = ({ src, hardRedirect = false, autoPrompt = true }) => {
  const navigate = useNavigate();

  //Global State
  const dispatch = useDispatch();

  const handleLoginButtonOnClick = (e) => {
    trackLoginButtonClicked(window.location.href);

    if (hardRedirect) {
      navigate(PATHS.AUTH.SIGN_IN.ABSOLUTE);
      return;
    }
    dispatch(
      globalActions.toggleActiveModal({
        modalName: "authModal",
        newValue: true,
        newProps: {
          redirectURL: window.location.href,
          authMode: AUTH_ACTION_LABELS.LOG_IN,
          src: src,
          eventSource: window.location.href,
        },
      })
    );
  };

  const handleSignUpButtonOnClick = (e) => {
    trackSignUpButtonClicked(window.location.href);

    if (hardRedirect) {
      navigate(PATHS.AUTH.SIGN_UP.ABSOLUTE);
      return;
    }
    dispatch(
      globalActions.toggleActiveModal({
        modalName: "authModal",
        newValue: true,
        newProps: {
          redirectURL: window.location.href,
          authMode: AUTH_ACTION_LABELS.SIGN_UP,
          src: src,
          eventSource: window.location.href,
        },
      })
    );
  };

  return (
    <Space>
      <RQButton onClick={handleLoginButtonOnClick}>Sign in</RQButton>
      <RQButton type="primary" onClick={handleSignUpButtonOnClick}>
        Sign up
      </RQButton>
    </Space>
  );
};

export default AuthButtons;
