import React, { useState, useEffect } from "react";
// SUB COMPONENT
import LoginRequiredCTA from "../../authentication/LoginRequiredCTA";
//UTILS
import { getAppMode } from "../../../store/selectors";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { redirectToRules } from "utils/RedirectionUtils";
import {
  setEmailVerified,
  checkVerificationCode,
  resendVerificationEmailHandler,
  reloadAuth,
} from "../../../utils/AuthUtils";
import { getQueryParamsAsMap } from "../../../utils/URLUtils";
import ProCard from "@ant-design/pro-card";
import { Button } from "antd";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  trackEmailVerificationFailed,
  trackEmailVerificationSuccess,
} from "modules/analytics/events/common/auth/emailVerification";
import { MODES } from "./modes";

const VerifyEmail = () => {
  const navigate = useNavigate();
  //Component State
  const [continueUrl, setContinueUrl] = useState(null);
  const [verified, setVerified] = useState(false);
  const [isVerificationFailed, setIsVerificationFailed] = useState(false);
  const [checkedActionCode, setCheckedActionCode] = useState(false);
  const [mode, setMode] = useState(MODES.OPENED_FROM_EMAIL);

  //Global State
  const user = useSelector(getUserAuthDetails);
  const appMode = useSelector(getAppMode);
  const params = getQueryParamsAsMap();

  useEffect(() => {
    const params = getQueryParamsAsMap();
    if (params["mode"] === MODES.NEW) setMode(MODES.NEW);
    if (params[`oobCode`] && !checkedActionCode && user.loggedIn) {
      setCheckedActionCode(true);
      setContinueUrl(params["continueUrl"]);
      checkVerificationCode(params["oobCode"])
        .then(async (resp) => {
          setVerified(true);
          await setEmailVerified(user.details.profile.uid, true);
          await reloadAuth();
          // ANALYTICS
          // Event label = event category _ event action
          trackEmailVerificationSuccess();
          //hard redirect to rules page
          redirectToRules(navigate, true);
        })
        .catch((err) => {
          setVerified(false);
          setIsVerificationFailed(true);
          trackEmailVerificationFailed();
        });
    }
  }, [user.loggedIn, user.details, checkedActionCode, verified, appMode, navigate]);

  return (
    <React.Fragment>
      {user.loggedIn ? (
        <ProCard className="primary-card github-like-border" title={null}>
          {isVerificationFailed ? (
            <>
              <h3>Oops! Looks like the email verification link is invalid or expired.</h3>
              <Button
                color="primary"
                type="button"
                onClick={() =>
                  resendVerificationEmailHandler({
                    callbackURL: params["callbackURL"] ? new URL(params["callbackURL"]).href : null,
                  })
                }
              >
                Resend Verification email
              </Button>
            </>
          ) : (
            <>
              {verified && continueUrl ? (
                <div>
                  <h3>Your Email has been successfully verified.</h3>
                  <h5 className="title is-6">Redirecting you to Home</h5>
                </div>
              ) : (
                <div>
                  {mode === MODES.NEW ? (
                    <>
                      <h3>Please verify your email to continue</h3>
                      <Button
                        color="primary"
                        type="button"
                        onClick={() =>
                          resendVerificationEmailHandler({
                            callbackURL: params["callbackURL"] ? new URL(params["callbackURL"]).href : null,
                          })
                        }
                      >
                        Send Verification email
                      </Button>
                    </>
                  ) : (
                    <>
                      <h3>Verifying...</h3>
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </ProCard>
      ) : (
        <LoginRequiredCTA />
      )}
    </React.Fragment>
  );
};
export default VerifyEmail;
