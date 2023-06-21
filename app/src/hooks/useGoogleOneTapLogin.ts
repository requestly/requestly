import { useEffect } from "react";
import { useScript } from "./useScript";

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

interface IdConfiguration {
  client_id: string;
  auto_select?: boolean;
  callback?: (response: CredentialResponse) => any;
  native_callback?: (response: CredentialResponse) => any;
  cancel_on_tap_outside?: boolean;
  prompt_parent_id?: string;
  nonce?: string;
  context?: string;
  state_cookie_domain?: string;
  allowed_parent_origin?: string;
  intermediate_iframe_close_callback?: string;
}

interface UseGoogleOneTapLoginProps extends IdConfiguration {
  disabled?: boolean;
}

export const useGoogleOneTapLogin = (configuration: UseGoogleOneTapLoginProps) => {
  const script = useScript(googleSignInScriptURL);
  const listener = useEffect(() => {
    if (script === "ready" && !configuration.disabled) {
      window.google.accounts.id.initialize({ ...configuration });
      window.google.accounts.id.prompt();
    }
  }, [configuration, script]);

  return () => listener;
};
