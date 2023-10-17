import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Row, Typography } from "antd";
import SpinnerColumn from "../SpinnerColumn";
import { RQButton, RQInput } from "lib/design-system/components";
// ACTIONS
import { actions } from "store";
import { getIsWorkspaceMode } from "store/features/teams/selectors";
import { getAppMode, getUserAuthDetails } from "../../../store/selectors";
import { isEmailValid } from "../../../utils/FormattingHelper";

import { signInWithEmailLink } from "../../../actions/FirebaseActions";
import { handleLogoutButtonOnClick } from "../../authentication/AuthForm/actions";
import { redirectToRules } from "utils/RedirectionUtils";

import "./index.css";
import { toast } from "utils/Toast";
import {
  trackSignInWithLinkCustomFormSeen,
  trackSignInWithLinkCustomFormSubmitted,
} from "modules/analytics/events/common/auth/emailLinkSignin";

const SignInViaEmailLink = () => {
  //Component State
  const [userEmailfromLocalStorage, setUserEmailfromLocalStorage] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCustomLoginFlow, setIsCustomLoginFlow] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  //Global State
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const appMode = useSelector(getAppMode);
  const isWorkspaceMode = useSelector(getIsWorkspaceMode);
  const [isEmailLoginLinkDone, setIsEmailLoginLinkDone] = useState(false);
  const navigate = useNavigate();

  const logOutUser = useCallback(() => {
    handleLogoutButtonOnClick(appMode, isWorkspaceMode, dispatch).then(() => {
      dispatch(actions.updateRefreshPendingStatus({ type: "rules" }));
    });
  }, [appMode, dispatch, isWorkspaceMode]);

  const renderAlreadyLoggedInWarning = useCallback(() => {
    const shouldLogout = window.confirm(
      `You are already logged in${
        user.email ? ` as ${user.email}` : ""
      }. Do you want to continue login as ${userEmailfromLocalStorage}?`
    );
    if (shouldLogout === true) {
      logOutUser();
    } else {
      setIsEmailLoginLinkDone(true);
    }
    return <SpinnerColumn />;
  }, [user.email, userEmailfromLocalStorage, logOutUser]);

  useEffect(() => {
    if (user.loggedIn && isEmailLoginLinkDone) {
      const name = user?.displayName?.split(" ")[0];
      let message = isLogin ? "Welcome back to Requestly!" : "Welcome to Requestly!";
      if (name) {
        message = isLogin ? `Welcome back ${name}!` : `Welcome to Requestly ${name}!`;
      }
      toast.success(message);
      redirectToRules(navigate);
    }
  }, [user.loggedIn, isEmailLoginLinkDone, navigate, isLogin, user.displayName, user.email]);

  const handleLogin = useCallback(
    (emailToUseForLogin) => {
      const loginEmail = emailToUseForLogin;
      if (loginEmail) {
        setIsProcessing(true);
        if (user.loggedIn) {
          renderAlreadyLoggedInWarning();
        }
        signInWithEmailLink(loginEmail)
          .then((response) => {
            if (response) {
              const { authData, isNewUser } = response;
              if (authData) {
                window.localStorage.removeItem("RQEmailForSignIn");
                setIsLogin(!isNewUser);
                if (isNewUser) window.localStorage.setItem("isNewUser", !!isNewUser);
                setIsProcessing(false);
                setIsEmailLoginLinkDone(true);
              } else throw new Error("Failed");
            }
          })
          .catch(() => {
            setIsProcessing(false);
            setUserEmailfromLocalStorage(null);
          });
      } else {
        window.alert("Could not get the email to log into, please try again. If the problem persists, contact support");
      }
    },
    [user.loggedIn, renderAlreadyLoggedInWarning]
  );

  const renderEmailInputForm = () => {
    return (
      <div className="email-entry-form-container">
        <Row justify="center">
          <Typography.Title level={2}>
            Hey, It appears that you are accessing Requestly from a new web browser
          </Typography.Title>
        </Row>
        <Row justify="center" className="mb-2">
          <Typography.Text strong style={{ fontSize: "1rem" }}>
            Kindly re-enter your email address to proceed.
          </Typography.Text>
        </Row>
        <Row className="w-100 mb-16" justify="center">
          <RQInput
            id="SignInViaEmailLinkInputField"
            className="email-entry-form-input"
            placeholder="name@example.com"
            type="email"
            required
            value={emailInput}
            onChange={(e) => {
              setEmailInput(e.target.value);
            }}
          />
        </Row>
        <Row className="w-100" justify="center">
          <RQButton
            id="SignInViaEmailLinkLoginBtn"
            type="primary"
            size="large"
            onClick={(e) => {
              e.preventDefault();
              trackSignInWithLinkCustomFormSubmitted();
              handleLogin(emailInput);
            }}
            loading={isProcessing}
          >
            Login
          </RQButton>
        </Row>
      </div>
    );
  };

  useEffect(() => {
    const emailFromStorage = window.localStorage.getItem("RQEmailForSignIn");

    if (!emailFromStorage) setIsCustomLoginFlow(true);
    else {
      const email = isEmailValid(emailFromStorage) ? emailFromStorage : null;

      setUserEmailfromLocalStorage(email);
      if (!user.isLoggedIn && email) {
        handleLogin(email);
      }
    }
  }, [handleLogin, user.isLoggedIn]);

  useEffect(() => {
    if (isCustomLoginFlow) trackSignInWithLinkCustomFormSeen();
  }, [isCustomLoginFlow]);

  return isCustomLoginFlow ? (
    renderEmailInputForm()
  ) : user.isLoggedIn ? (
    renderAlreadyLoggedInWarning()
  ) : (
    <SpinnerColumn />
  );
};

export default SignInViaEmailLink;
