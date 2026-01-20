import { useState, useEffect, useMemo, useCallback } from "react";
import { useScript } from "./useScript";
import { useSelector } from "react-redux";
import { getAppMode } from "store/selectors";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { handleOnetapSignIn } from "actions/FirebaseActions";
import { isAppOpenedInIframe } from "utils/AppUtils";
//@ts-ignore
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/constants";
import PATHS from "config/constants/sub/paths";
import { useHasChanged } from "./useHasChanged";

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

const shouldShowOneTapPrompt = () => {
  if (
    window.location.href.includes(PATHS.AUTH.DEKSTOP_SIGN_IN.RELATIVE) ||
    window.location.href.includes(PATHS.AUTH.EMAIL_ACTION.RELATIVE) ||
    window.location.href.includes(PATHS.AUTH.EMAIL_LINK_SIGNIN.RELATIVE)
  ) {
    return false;
  }
  return true;
};

export const useGoogleOneTapLogin = () => {
  const [isNewUser, setIsNewUser] = useState<boolean>(false);
  const [oneTapScriptInitialized, setOneTapScriptInitialized] = useState<boolean>(false);
  const [oneTapPromptShown, setOneTapPromptShown] = useState<boolean>(false);
  const [isLoggedInUsingOneTapPrompt, setIsLoggedInUsingOneTapPrompt] = useState<boolean>(false);
  const scriptStatus = useScript(googleSignInScriptURL);
  const user = useSelector(getUserAuthDetails);
  const appMode = useSelector(getAppMode);
  const userLoginHasChanged = useHasChanged(user?.loggedIn);

  useEffect(() => {
    if (userLoginHasChanged && !user?.loggedIn && oneTapPromptShown) {
      setOneTapPromptShown(false);
    }
  }, [userLoginHasChanged, user?.loggedIn, oneTapPromptShown]);

  const handleSignIn = async (credential: CredentialResponse) => {
    handleOnetapSignIn(credential).then((res) => {
      setIsNewUser(res.is_new_user);
      setIsLoggedInUsingOneTapPrompt(true);
    });
  };

  const config = useMemo(() => {
    return {
      client_id: window.location.host.includes("app.requestly.io")
        ? "911299702852-u365fa2rdf8g64q144gtccna87rmd8ji.apps.googleusercontent.com"
        : "553216647714-b34rhgl06o7vokpebigjttrgebmm495h.apps.googleusercontent.com",
      disabled: isAppOpenedInIframe() || user?.loggedIn || appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP,
      prompt_parent_id: "one-tap-container",
      callback: handleSignIn,
      use_fedcm_for_prompt: true,
    };
  }, [user?.loggedIn, appMode]);

  const listener = useEffect(() => {
    if (scriptStatus === "ready" && !config.disabled && window.google && !oneTapScriptInitialized) {
      window.google.accounts.id.initialize({ ...config });
      setOneTapScriptInitialized(true);
    }
  }, [scriptStatus, config, oneTapScriptInitialized]);

  const promptOneTap = useCallback(() => {
    if (oneTapScriptInitialized && window.google && !oneTapPromptShown) {
      window.google.accounts.id.prompt();
      setOneTapPromptShown(true);
    }
  }, [oneTapScriptInitialized, oneTapPromptShown]);

  useEffect(() => {
    if (!user?.loggedIn) {
      setIsNewUser(false);
      setIsLoggedInUsingOneTapPrompt(false);
    }
  }, [user?.loggedIn]);

  return {
    initializeOneTap: () => listener,
    promptOneTap,
    shouldShowOneTapPrompt,
    isNewUser,
    isLoggedInUsingOneTapPrompt,
  };
};
