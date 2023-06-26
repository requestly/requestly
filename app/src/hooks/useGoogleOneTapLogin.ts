import { useState, useEffect, useMemo } from "react";
import { useScript } from "./useScript";
import { useSelector } from "react-redux";
import { getUserAuthDetails } from "store/selectors";
import { handleOnetapSignIn } from "actions/FirebaseActions";
import { trackOneTapPromptVisible } from "modules/analytics/events/common/auth/oneTapPrompt";

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

  const handleSignIn = async (credential: CredentialResponse) => {
    handleOnetapSignIn(credential).then((res) => {
      setIsNewUser(res.is_new_user);
      setIsLoggedInUsingOneTap(true);
    });
  };

  const config = useMemo(() => {
    return {
      client_id: "553216647714-b34rhgl06o7vokpebigjttrgebmm495h.apps.googleusercontent.com", //client ID of rq-beta,
      disabled: user?.loggedIn,
      prompt_parent_id: "one-tap-container",
      callback: handleSignIn,
    };
  }, [user?.loggedIn]);

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
