import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Row, Typography } from "antd";
import SpinnerColumn from "../SpinnerColumn";
import { RQButton, RQInput } from "lib/design-system/components";
import { actions } from "store";
import { getIsWorkspaceMode } from "store/features/teams/selectors";
import { getAppMode, getUserAuthDetails } from "../../../store/selectors";
import { isEmailValid } from "../../../utils/FormattingHelper";
import { signInWithEmailLink } from "../../../actions/FirebaseActions";
import { handleLogoutButtonOnClick } from "features/onboarding/components/auth/components/Form/actions";
import { redirectToRoot } from "utils/RedirectionUtils";
import { toast } from "utils/Toast";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";

import {
  trackSignInWithLinkCustomFormSeen,
  trackSignInWithLinkCustomFormSubmitted,
} from "modules/analytics/events/common/auth/emailLinkSignin";
import "./index.css";
import { trackAppOnboardingStepCompleted } from "features/onboarding/analytics";
import { ONBOARDING_STEPS } from "features/onboarding/types";
import Logger from "../../../../../common/logger";
import { getAppFlavour } from "utils/AppUtils";

const SignInViaEmailLink = () => {
  //Component State
  const [userEmailfromLocalStorage, setUserEmailfromLocalStorage] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCustomLoginFlow, setIsCustomLoginFlow] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  //Global State
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(getUserAuthDetails);
  const appMode = useSelector(getAppMode);
  const isWorkspaceMode = useSelector(getIsWorkspaceMode);
  const wasUserAlreadyLoggedIn = useRef(user.loggedIn);

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
    }
    return <SpinnerColumn />;
  }, [user.email, userEmailfromLocalStorage, logOutUser]);

  useEffect(() => {
    if (user.loggedIn) {
      const appFlavour = getAppFlavour();
      const name = user?.displayName?.split(" ")[0];
      let message = isLogin
        ? "Welcome back!"
        : `Welcome to ${appFlavour === GLOBAL_CONSTANTS.APP_FLAVOURS.SESSIONBEAR ? "SessionBear" : "Requestly"}!`;
      if (name) {
        message = isLogin ? `Welcome back ${name}!` : `Welcome ${name}!`;
      }
      toast.success(message);
      if (isLogin) {
        dispatch(actions.updateAppOnboardingCompleted());
      } else {
        dispatch(actions.updateAppOnboardingStep(ONBOARDING_STEPS.PERSONA));
        trackAppOnboardingStepCompleted(ONBOARDING_STEPS.AUTH);
      }
      redirectToRoot(navigate);
    }
  }, [dispatch, user.loggedIn, navigate, isLogin, user.displayName, user.email, user.details?.profile?.displayName]);

  const handleLogin = useCallback((emailToUseForLogin) => {
    const loginEmail = emailToUseForLogin;
    if (loginEmail) {
      setIsProcessing(true);
      signInWithEmailLink(loginEmail)
        .then((response) => {
          if (response) {
            const { authData, isNewUser } = response;
            if (authData.uid) {
              window.localStorage.removeItem("RQEmailForSignIn");
              setIsLogin(!isNewUser);
              if (isNewUser) {
                window.localStorage.setItem("isNewUser", Boolean(isNewUser));
              }
            } else throw new Error("Failed");
          }
        })
        .catch((e) => {
          Logger.log("[SignInViaEmailLink] handleLogin.catch", { e });
          setIsProcessing(false);
          setUserEmailfromLocalStorage(null);
        });
    } else {
      window.alert("Could not get the email to log into, please try again. If the problem persists, contact support");
    }
  }, []);

  const renderEmailInputForm = () => {
    return (
      <div className="email-entry-form-container">
        <Row justify="center">
          <Typography.Title level={2}>
            Hey, it appears that you are accessing Requestly from a new web browser
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
      if (!user.loggedIn && email) {
        handleLogin(email);
      }
    }
  }, [handleLogin, user.loggedIn]);

  useEffect(() => {
    if (isCustomLoginFlow) trackSignInWithLinkCustomFormSeen();
  }, [isCustomLoginFlow]);

  return isCustomLoginFlow ? (
    renderEmailInputForm()
  ) : wasUserAlreadyLoggedIn.current ? (
    renderAlreadyLoggedInWarning()
  ) : (
    <SpinnerColumn />
  );
};

export default SignInViaEmailLink;
