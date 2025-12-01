import React, { useRef } from "react";
import PageLoader from "components/misc/PageLoader";
import firebaseApp from "firebase";
import { getAuth, signInWithCustomToken } from "firebase/auth";
import Logger from "../../../../../common/logger";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getAppMode } from "store/selectors";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { redirectToHome } from "utils/RedirectionUtils";
import PATHS from "config/constants/sub/paths";
import { getDesktopAppAuthParams } from "../utils";
import { globalActions } from "store/slices/global/slice";
import { trackSignUpFailedEvent, trackSignupSuccessEvent } from "modules/analytics/events/common/auth/signup";
import { trackLoginSuccessEvent } from "modules/analytics/events/common/auth/login";
import * as Sentry from "@sentry/react";
import { AUTH_PROVIDERS } from "modules/analytics/constants";
import { clearRedirectMetadata, getRedirectMetadata } from "features/onboarding/utils";

const ARGUMENTS = {
  REDIRECT_URL: "redirectURL",
  ACCESS_TOKEN: "accessToken",
};

const LoginHandler: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const appMode = useSelector(getAppMode);
  const user = useSelector(getUserAuthDetails);

  const isAuthenticationAttempted = useRef(false);

  const [loginComplete, setLoginComplete] = useState(false);

  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const isNewUser = params.get("isNewUser") === "true";

  const postLoginDesktopAppRedirect = useCallback(() => {
    let desktopAuthParams = getDesktopAppAuthParams();

    if (!desktopAuthParams) {
      return;
    }

    const authMode = desktopAuthParams.get("auth_mode");
    const oneTimeCode = desktopAuthParams.get("ot-auth-code");

    if (oneTimeCode && authMode) {
      if (isNewUser) {
        desktopAuthParams.set("isNewUser", "true");
      }
      desktopAuthParams.append("skip", "true");
      /*
       marking onboarding as completed because user is authenticating from desktop app
       so onboarding is going to be visible in desktop app
       */
      dispatch(globalActions.updateIsOnboardingCompleted(true));
      navigate(`${PATHS.AUTH.DEKSTOP_SIGN_IN.ABSOLUTE}?${desktopAuthParams.toString()}`);
      return;
    }
  }, [navigate, isNewUser, dispatch]);

  const redirect = useCallback(
    (url: string) => {
      try {
        const urlObj = new URL(url);
        if (window.location.hostname === urlObj.hostname) {
          const navigateParams = urlObj.pathname + urlObj.search;
          navigate(navigateParams);
        } else {
          window.open(url, "_self");
        }
      } catch (error) {
        Logger.log("[LoginHandler-redirect] catch", { error });
        Sentry.captureException(error, {
          extra: { url },
        });
        redirectToHome(appMode, navigate);
      }
    },
    [appMode, navigate]
  );

  const postLoginActions = useCallback(() => {
    const desktopAuthParams = getDesktopAppAuthParams();
    if (desktopAuthParams) {
      postLoginDesktopAppRedirect();
      return;
    }

    const redirectMetadata = getRedirectMetadata();
    if (!isNewUser) {
      // @ts-ignore
      trackLoginSuccessEvent({ auth_provider: AUTH_PROVIDERS.BROWSERSTACK, source: redirectMetadata?.source });
    }

    const redirectURLFromParam = params.get(ARGUMENTS.REDIRECT_URL);

    const redirectURLFromLocalStorage = redirectMetadata?.redirectURL;
    if (redirectURLFromLocalStorage) {
      clearRedirectMetadata();
    }

    redirect(redirectURLFromParam ?? redirectURLFromLocalStorage ?? "");
  }, [redirect, params, postLoginDesktopAppRedirect, isNewUser]);

  useEffect(() => {
    if (user.loggedIn && loginComplete) {
      postLoginActions();
    }
  }, [postLoginActions, user.loggedIn, loginComplete]);

  useEffect(() => {
    if (isAuthenticationAttempted.current) {
      return;
    }

    isAuthenticationAttempted.current = true;
    const accessToken = params.get(ARGUMENTS.ACCESS_TOKEN);
    if (!accessToken) {
      // this route is only meant to be accessed programmatically
      redirectToHome(appMode, navigate);
      return;
    }

    const desktopAuthParams = getDesktopAppAuthParams();
    if (!desktopAuthParams && user.loggedIn && !loginComplete) {
      const overrideCurrentAuth = window.confirm(
        "You will be signed out from the current session, do you want to continue?"
      );
      if (!overrideCurrentAuth) {
        setLoginComplete(true);
        return;
      }
    }

    const redirectMetadata = getRedirectMetadata();
    const auth = getAuth(firebaseApp);
    signInWithCustomToken(auth, accessToken)
      .then((result) => {
        Logger.log("User logged in successfully", result);
        setLoginComplete(true);
        if (isNewUser) {
          // @ts-ignore
          trackSignupSuccessEvent({
            email: result.user.email,
            domain: result.user.email?.split("@")[1],
            auth_provider: AUTH_PROVIDERS.BROWSERSTACK,
            source: redirectMetadata?.source,
          });
        }
        /* Auth flow was triggered from web app,
        "auth_mode" param check is added to make sure persona modal is triggered only for web app
        */
        if (!desktopAuthParams?.has("auth_mode") && isNewUser) {
          dispatch(globalActions.updateIsNewUser(true));
        }
      })
      .catch((error) => {
        Logger.log("[LoginHandler-signInWithCustomToken] catch", { error });
        Sentry.captureMessage("[Auth] Sign in with custom token failed", {
          tags: {
            flow: "auth",
          },
          extra: { error, source: "LoginHandler-signInWithCustomToken" },
        });
        // @ts-ignore
        trackSignUpFailedEvent({
          error: error?.message,
          auth_provider: AUTH_PROVIDERS.BROWSERSTACK,
          source: redirectMetadata?.source,
        });
        // for now redirecting even when facing errors
        // todo: setup error monitoring
        setLoginComplete(true);
      });
  }, [params, user.loggedIn, loginComplete, navigate, appMode, dispatch, isNewUser]);

  return <PageLoader message="Logging in..." />;
};

export default LoginHandler;
