import { useState, useEffect, useMemo } from "react";
import { useScript } from "./useScript";
import { useSelector } from "react-redux";
import { getUserAuthDetails, getAppMode } from "store/selectors";
import { handleOnetapSignIn } from "actions/FirebaseActions";
import { trackOneTapPromptVisible } from "modules/analytics/events/common/auth/oneTapPrompt";
//@ts-ignore
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";

//google signIn client libary for fetching user cred
const googleSignInScriptURL: string = "https://accounts.google.com/gsi/client";

declare global {
  interface Window {
    google: any;
    [key: string]: any;
  }
}

interface CredentialResponse {
  credential: string;
  select_by: string;
  client_id: string;
}

export const useGoogleOneTapLogin = () => {
  const [isNewUser, setIsNewUser] = useState<boolean>(false);
  const [loggedInUsingOneTap, setIsLoggedInUsingOneTap] = useState<boolean>(false);
  const script = useScript(googleSignInScriptURL);
  const user = useSelector(getUserAuthDetails);
  const appMode = useSelector(getAppMode);

  const handleSignIn = async (credential: CredentialResponse) => {
    handleOnetapSignIn(credential).then((res) => {
      setIsNewUser(res.is_new_user);
      setIsLoggedInUsingOneTap(true);
    });
  };

  const config = useMemo(() => {
    return {
      client_id: window.location.host.includes("app.requestly.io")
        ? "911299702852-u365fa2rdf8g64q144gtccna87rmd8ji.apps.googleusercontent.com"
        : "553216647714-b34rhgl06o7vokpebigjttrgebmm495h.apps.googleusercontent.com",
      disabled: user?.loggedIn || appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP,
      prompt_parent_id: "one-tap-container",
      callback: handleSignIn,
    };
  }, [user?.loggedIn, appMode]);

  const listener = useEffect(() => {
    if (script === "ready" && !config.disabled) {
      window.google.accounts.id.initialize({ ...config });
      window.google.accounts.id.prompt((notification: any) => {
        if (notification.isDisplayed()) {
          trackOneTapPromptVisible();
        }
      });
    }
  }, [script, config]);

  useEffect(() => {
    if (!user?.loggedIn) {
      setIsNewUser(false);
      setIsLoggedInUsingOneTap(false);
    }
  }, [user?.loggedIn]);

  return {
    promptOneTapOnLoad: () => listener,
    isNewUser,
    loggedInUsingOneTap,
  };
};
