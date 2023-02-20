import React, { useCallback, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Button, Space } from "antd";
//CONSTANTS
import APP_CONSTANTS from "../../../../config/constants";
import { AUTH } from "modules/analytics/events/common/constants";
import { actions } from "../../../../store";
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
      actions.toggleActiveModal({
        modalName: "authModal",
        newValue: true,
        newProps: {
          redirectURL: window.location.href,
          authMode: AUTH_ACTION_LABELS.LOG_IN,
          src: src,
          eventSource: AUTH.SOURCE.LOGIN_CTA,
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
      actions.toggleActiveModal({
        modalName: "authModal",
        newValue: true,
        newProps: {
          redirectURL: window.location.href,
          authMode: AUTH_ACTION_LABELS.SIGN_UP,
          src: src,
          eventSource: AUTH.SOURCE.SIGNUP_CTA,
        },
      })
    );
  };
  const stableHandleSignUpButtonOnClick = useCallback(
    handleSignUpButtonOnClick,
    [dispatch, hardRedirect, navigate, src]
  );

  useEffect(() => {
    if (autoPrompt && !hardRedirect) stableHandleSignUpButtonOnClick();
  }, [autoPrompt, hardRedirect, stableHandleSignUpButtonOnClick]);

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
