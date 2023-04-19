import React, { useEffect, useState } from "react";
// import Redirect from "react-router-dom";
//SUB COMPONENTS
// import Header from "../../sections/Headers/Header";
import SpinnerCard from "../SpinnerCard";
import RedirectWithTimer from "../RedirectWithTimer";
// UTILS
import { getQueryParamsAsMap } from "../../../utils/URLUtils";
// CONSTANTS
import APP_CONSTANTS from "../../../config/constants";
const { PATHS } = APP_CONSTANTS;

const EmailAction = () => {
  // COMPONENT STATE
  const [redirectPath, setRedirectPath] = useState("");

  useEffect(() => {
    const params = getQueryParamsAsMap();
    const queryParamString = window.location.search;
    if (params["mode"]) {
      switch (params["mode"]) {
        case "resetPassword":
          setRedirectPath(PATHS.AUTH.RESET_PASSWORD.RELATIVE + queryParamString);
          break;
        case "verifyEmail":
          setRedirectPath(PATHS.AUTH.VERIFY_EMAIL.RELATIVE + queryParamString);
          break;
        case "signIn":
          setRedirectPath(PATHS.AUTH.EMAIL_LINK_SIGNIN.RELATIVE + queryParamString);
          break;
        default:
          setRedirectPath(PATHS.RULES.RELATIVE);
      }
    } else {
      setRedirectPath(PATHS.RULES.RELATIVE);
    }
  }, [redirectPath]);

  return redirectPath ? (
    <RedirectWithTimer delay={0} path={redirectPath} />
  ) : (
    <SpinnerCard customLoadingMessage="Please Wait ... " />
  );
};

export default EmailAction;
