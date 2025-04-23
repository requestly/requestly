import React from "react";
import { useDispatch } from "react-redux";
import { Button, Space } from "antd";
//CONSTANTS
import APP_CONSTANTS from "../../../../config/constants";
import { SOURCE } from "modules/analytics/events/common/constants";
import { globalActions } from "store/slices/global/slice";
import { useNavigate } from "react-router-dom";
import PATHS from "config/constants/sub/paths";

const { ACTION_LABELS: AUTH_ACTION_LABELS } = APP_CONSTANTS.AUTH;

const AuthButtons = ({ src, hardRedirect = false, autoPrompt = true }) => {
  const navigate = useNavigate();

  //Global State
  const dispatch = useDispatch();

  const handleLoginButtonOnClick = (e) => {
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
          eventSource: SOURCE.LOGIN_CTA,
        },
      })
    );
  };

  const handleSignUpButtonOnClick = (e) => {
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
          eventSource: SOURCE.SIGNUP_CTA,
        },
      })
    );
  };

  return (
    <Space>
      <Button type="primary" onClick={handleLoginButtonOnClick}>
        Login
      </Button>
      <Button type="primary" onClick={handleSignUpButtonOnClick}>
        Sign up
      </Button>
    </Space>
  );
};

export default AuthButtons;
