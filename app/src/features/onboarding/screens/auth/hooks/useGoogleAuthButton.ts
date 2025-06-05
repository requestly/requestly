import { useEffect, useMemo } from "react";
import { CredentialResponse } from "../types";

declare global {
  interface Window {
    google: any;
    [key: string]: any;
  }
}

export const useGoogleAuthButton = ({
  callback,
  type,
}: {
  callback: (credential: CredentialResponse) => void;
  type: "primary" | "secondary";
}) => {
  const config = useMemo(() => {
    return {
      client_id: window.location.host.includes("app.requestly.io")
        ? "911299702852-u365fa2rdf8g64q144gtccna87rmd8ji.apps.googleusercontent.com"
        : "553216647714-b34rhgl06o7vokpebigjttrgebmm495h.apps.googleusercontent.com",
      callback: callback,
    };
  }, [callback]);

  useEffect(() => {
    if (window.google) {
      window.google.accounts.id.initialize({ ...config });
      window.google.accounts.id.renderButton(document.getElementById("rq-google-auth-button"), {
        type: "standard",
        theme: type === "primary" ? "filled_blue" : "filled_black",
        size: "large",
        text: "continue_with",
        shape: "rectangular",
        logo_alignment: "right",
        width: 336,
        height: 40,
      });
    }
  }, [config, type]);
};
