import React from "react";
import PageLoader from "components/misc/PageLoader";
import firebaseApp from "firebase";
import { getAuth, signInWithCustomToken } from "firebase/auth";
import Logger from "lib/logger";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getAppMode } from "store/selectors";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { redirectToHome } from "utils/RedirectionUtils";

const ARGUMENTS = {
  REDIRECT_URL: "redirectURL",
  ACCESS_TOKEN: "accessToken",
};

const AUTH_TRIGGER_SOURCE_LOCAL_KEY = "authTriggerSource";

const LoginHandler: React.FC = () => {
  const navigate = useNavigate();
  const appMode = useSelector(getAppMode);
  const user = useSelector(getUserAuthDetails);

  const [loginComplete, setLoginComplete] = useState(false);

  const params = useMemo(() => new URLSearchParams(window.location.search), []);

  const redirect = useCallback(
    (url: string) => {
      if (!url) {
        // just in case
        redirectToHome(appMode, navigate);
      }
      const urlObj = new URL(url);
      if (window.location.hostname === urlObj.hostname) {
        const navigateParams = urlObj.pathname + urlObj.search;
        navigate(navigateParams);
      } else {
        window.open(url, "_self");
      }
    },
    [appMode, navigate]
  );

  const postLoginActions = useCallback(() => {
    const redirectURLFromParam = params.get(ARGUMENTS.REDIRECT_URL);
    const redirectURLFromLocalStorage = window.localStorage.getItem(AUTH_TRIGGER_SOURCE_LOCAL_KEY);
    if (redirectURLFromLocalStorage) {
      window.localStorage.removeItem(AUTH_TRIGGER_SOURCE_LOCAL_KEY);
    }
    redirect(redirectURLFromParam ?? redirectURLFromLocalStorage);
  }, [redirect, params]);

  useEffect(() => {
    if (user.loggedIn && loginComplete) {
      postLoginActions();
    }
  }, [postLoginActions, user.loggedIn, loginComplete]);

  useEffect(() => {
    const accessToken = params.get(ARGUMENTS.ACCESS_TOKEN);
    if (!accessToken) {
      // this route is only meant to be accessed programmatically
      redirectToHome(appMode, navigate);
    }

    if (user.loggedIn && !loginComplete) {
      const overrideCurrentAuth = window.confirm(
        "You will be logged out from the current session, do you want to continue?"
      );
      if (!overrideCurrentAuth) {
        setLoginComplete(true);
        return;
      }
    }
    const auth = getAuth(firebaseApp);
    signInWithCustomToken(auth, accessToken)
      .then((user) => {
        Logger.log("User logged in successfully", user);
        setLoginComplete(true);
      })
      .catch((error) => {
        Logger.error("Error signing in with custom token:", error);
        // for now redirecting even when facing errors
        // todo: setup error monitoring
        setLoginComplete(true);
      });
  }, [params, postLoginActions, user.loggedIn, loginComplete, navigate, appMode]);

  return <PageLoader message="Logging in..." />;
};

export default LoginHandler;
