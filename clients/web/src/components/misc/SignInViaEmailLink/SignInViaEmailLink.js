import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Row, Typography } from "antd";
import SpinnerColumn from "../SpinnerColumn";
import { RQButton, RQInput } from "lib/design-system/components";
import { globalActions } from "store/slices/global/slice";
import { getAppMode } from "../../../store/selectors";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { isEmailValid } from "../../../utils/FormattingHelper";
import { signInWithEmailLink } from "../../../actions/FirebaseActions";
import { handleLogoutButtonOnClick } from "features/onboarding/components/auth/components/Form/actions";
import { redirectToRoot } from "utils/RedirectionUtils";
import { toast } from "utils/Toast";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/constants";

import {
  trackSignInWithLinkCustomFormSeen,
  trackSignInWithLinkCustomFormSubmitted,
} from "modules/analytics/events/common/auth/emailLinkSignin";
import "./index.css";
import { trackAppOnboardingStepCompleted } from "features/onboarding/analytics";
import { ONBOARDING_STEPS } from "features/onboarding/types";
import { LOGGER as Logger } from "@requestly/utils";
import { getAppFlavour } from "utils/AppUtils";
import { isActiveWorkspaceShared } from "store/slices/workspaces/selectors";

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
  const isSharedWorkspaceMode = useSelector(isActiveWorkspaceShared);
  const wasUserAlreadyLoggedIn = useRef(user.loggedIn);

  const logOutUser = useCallback(() => {
    handleLogoutButtonOnClick(appMode, isSharedWorkspaceMode, dispatch).then(() => {
      dispatch(globalActions.updateRefreshPendingStatus({ type: "rules" }));
    });
  }, [appMode, dispatch, isSharedWorkspaceMode]);

  const renderAlreadyLoggedInWarning = useCallback(() => {
    const shouldLogout = window.confirm(
      `You are already signed in${
        user.email ? ` as ${user.email}` : ""
      }. Do you want to continue sign in as ${userEmailfromLocalStorage}?`
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
        dispatch(globalActions.updateAppOnboardingCompleted());
      } else {
        dispatch(globalActions.updateAppOnboardingStep(ONBOARDING_STEPS.PERSONA));
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
            Sign in
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
