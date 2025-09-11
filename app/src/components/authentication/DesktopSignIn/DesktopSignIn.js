import React, { useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";
import { FaExclamationCircle } from "@react-icons/all-files/fa/FaExclamationCircle";
import { FaSpinner } from "@react-icons/all-files/fa/FaSpinner";
import firebaseApp from "../../../firebase";
import { getFunctions, httpsCallable } from "firebase/functions";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import AuthModalHeader from "features/onboarding/components/OnboardingHeader/OnboardingHeader";
import { getEmailType } from "utils/mailCheckerUtils";
import {
  trackSignupSuccessEvent,
  trackSignUpAttemptedEvent,
  trackSignUpFailedEvent,
} from "modules/analytics/events/common/auth/signup";
import { AUTH_PROVIDERS } from "modules/analytics/constants";
import { trackLoginAttemptedEvent, trackLoginSuccessEvent } from "modules/analytics/events/common/auth/login";
import { redirectToDesktopApp, redirectToOAuthUrl, redirectToWebAppHomePage } from "utils/RedirectionUtils";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { AuthMode } from "features/onboarding/screens/auth/types";
import { OnboardingCard } from "features/onboarding/componentsV2/OnboardingCard/OnboardingCard";
import { AuthMessageCard } from "./AuthMessageCard/AuthMessageCard";
import { MdOutlineCheckCircle } from "@react-icons/all-files/md/MdOutlineCheckCircle";
import STORAGE from "config/constants/sub/storage";
import { globalActions } from "store/slices/global/slice";
import { getDesktopAppAuthParams } from "../utils";
import PATHS from "config/constants/sub/paths";
import { toast } from "utils/Toast";
import "./desktopSignIn.scss";

const DesktopSignIn = () => {
  const dispatch = useDispatch();
  const [allDone, setAllDone] = useState(false);
  const [isError, setIsError] = useState(false);
  const [authUser, setAuthUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const auth = getAuth(firebaseApp);
  const user = useSelector(getUserAuthDetails);

  const params = useMemo(() => new URLSearchParams(window.location.search), []);

  const toggleAuthModal = useCallback(
    (value, eventSource) => {
      dispatch(
        globalActions.toggleActiveModal({
          modalName: "authModal",
          newValue: value,
          newProps: {
            closable: false,
            eventSource,
          },
        })
      );
    },
    [dispatch]
  );

  useLayoutEffect(() => {
    // Avoids cyclic loop, if we are comming from "/login" ie sign up flow
    if (params.has("skip")) {
      setLoading(true);
      return;
    }

    window.localStorage.setItem(
      STORAGE.LOCAL_STORAGE.RQ_DESKTOP_APP_AUTH_PARAMS,
      JSON.stringify({ params: params.toString(), createdAt: Date.now() })
    );
    const authMode = params.get("auth_mode");
    const source = params.get("source");

    if (authMode === AuthMode.SIGN_UP) {
      redirectToOAuthUrl(navigate);
      return;
    }

    if (params.has("ot-auth-code")) {
      toggleAuthModal(true, source);
    } else {
      redirectToWebAppHomePage(navigate);
    }
  }, [navigate, toggleAuthModal, params]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAuthUser(user);
        toggleAuthModal(false);
        setLoading(false);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [auth, toggleAuthModal]);

  const handleDoneSignIn = useCallback(
    async (firebaseUser) => {
      setLoading(true);
      const desktopAuthParams = getDesktopAppAuthParams();

      if (!desktopAuthParams) {
        throw new Error("Desktop app auth params not found!");
      }

      const token = await firebaseUser?.getIdToken();

      const isNewUser = params.get("isNewUser");
      const isAuthForSetappBuild = params.get("isAuthForSetappBuild") === "true";
      const code = desktopAuthParams.get("ot-auth-code");
      let source = desktopAuthParams.get("source").replace(/ /g, "_");
      source = `desktop_app_${source}`;

      const functions = getFunctions();
      const createAuthToken = httpsCallable(functions, "auth-createAuthToken");

      let uid = firebaseUser?.uid || null;
      let email = firebaseUser?.email || null;

      const emailType = await getEmailType(email);

      createAuthToken({
        oneTimeCode: code,
        idToken: token,
      })
        .then(() => {
          setAllDone(true);
          if (isNewUser) {
            trackSignUpAttemptedEvent({
              auth_provider: AUTH_PROVIDERS.GMAIL,
              source,
            });
            trackSignupSuccessEvent({
              auth_provider: AUTH_PROVIDERS.GMAIL,
              email,
              uid,
              email_type: emailType,
              domain: email.split("@")[1],
              source,
            });
          } else {
            trackLoginAttemptedEvent({
              auth_provider: AUTH_PROVIDERS.GMAIL,
              source,
            });
            trackLoginSuccessEvent({
              auth_provider: AUTH_PROVIDERS.GMAIL,
              source,
            });
          }
          /*
          TODO: FIX THIS
          We are sending user to /desktop/intercept-traffic post authentication for now, to make sure that user is able to see the persona questionnaire post redirection to desktop app.
          */
          redirectToDesktopApp(
            `${PATHS.DESKTOP.INTERCEPT_TRAFFIC.ABSOLUTE}?isNewUser=${isNewUser}`,
            isAuthForSetappBuild
          );
        })
        .catch((err) => {
          setIsError(true);
          toast.error("Something went wrong, please try again from desktop app");
          trackSignUpFailedEvent({
            auth_provider: AUTH_PROVIDERS.GMAIL, // TODO: update provider
            error_message: err.message,
            source,
          });
        })
        .finally(() => {
          toggleAuthModal(false);
          setLoading(false);
          window.localStorage.removeItem(STORAGE.LOCAL_STORAGE.RQ_DESKTOP_APP_AUTH_PARAMS);
        });
    },
    [toggleAuthModal, params]
  );

  useEffect(() => {
    if (allDone) {
      return;
    }

    // triggering signin only if this was triggered properly from the desktop app
    const desktopAppAuthParams = getDesktopAppAuthParams();
    if (!desktopAppAuthParams) {
      return;
    }

    if (user.loggedIn && authUser) {
      handleDoneSignIn(authUser);
    }
  }, [allDone, handleDoneSignIn, navigate, user.loggedIn, authUser, toggleAuthModal]);

  const renderLoading = (
    <AuthMessageCard showCloseBtn={false} icon={<FaSpinner className="icon-spin" />} message="Authenticating..." />
  );

  const renderErrorMessage = (
    <AuthMessageCard
      icon={<FaExclamationCircle />}
      message="An unexpected error has occurred. Please close this window and try logging in again."
    />
  );

  const renderAllDone = (
    <AuthMessageCard
      icon={<MdOutlineCheckCircle style={{ color: "var(--requestly-color-success)" }} />}
      message="You are now signed in to the Requestly desktop app. You can safely close this window."
    />
  );

  return (
    <>
      <div className="desktop-app-auth-sign-in-container">
        <div className="desktop-app-auth-sign-in-content">
          <AuthModalHeader onHeaderButtonClick={() => redirectToWebAppHomePage(navigate)} />
          <OnboardingCard>
            {loading ? renderLoading : isError ? renderErrorMessage : allDone ? renderAllDone : renderLoading}
          </OnboardingCard>
        </div>
      </div>
    </>
  );
};

export default DesktopSignIn;
