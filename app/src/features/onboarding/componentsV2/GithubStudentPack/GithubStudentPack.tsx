import React, { useCallback, useState } from "react";
import { RQButton } from "lib/design-system-v2/components";
import { authorizeWithGithub } from "actions/FirebaseActions";
import { getFunctions, httpsCallable } from "@firebase/functions";
import { toast } from "utils/Toast";
import { useDispatch, useSelector } from "react-redux";
import "./githubStudentPack.scss";
import { redirectToHome } from "utils/RedirectionUtils";
import { getAppMode } from "store/selectors";
import { useNavigate } from "react-router-dom";
import { trackEvent } from "modules/analytics";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { globalActions } from "store/slices/global/slice";
import APP_CONSTANTS from "config/constants";

export const GithubStudentPack: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const appMode = useSelector(getAppMode);
  const user = useSelector(getUserAuthDetails);

  const [showNotGrantedMessage, setShowNotGrantedMessage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleGithubAuthorization = useCallback(async () => {
    setIsLoading(true);
    try {
      const { accessToken, email } = await authorizeWithGithub(() => {}, "github_student_pack");

      if (!accessToken || !email) {
        toast.error("Failed to connect with Github. Please try again.");
        setIsLoading(false);
        return;
      }

      if (email !== user.details?.profile?.email) {
        toast.error(
          <>
            <span>Your Github email doesn't match your Requestly email.</span>
            <br />
            <span>Login to Requestly with the same Github email to get student access.</span>
          </>,
          20
        );
        setIsLoading(false);
        return;
      }

      const activateGithubStudentAccess = httpsCallable<
        { code: string },
        { success: boolean; granted: boolean; error: string }
      >(getFunctions(), "subscription-activateGithubStudentAccess");

      const result = await activateGithubStudentAccess({ code: accessToken });
      const data = result.data;
      if (data.success) {
        if (data.granted) {
          setShowNotGrantedMessage(false);
          toast.success("Congratulations! You've been granted the Professional plan via the GitHub Student Pack.", 15);
          trackEvent("github_student_verification_success");
          redirectToHome(appMode, navigate);
        } else {
          setShowNotGrantedMessage(true);
          trackEvent("github_student_verification_failed");
        }
      } else {
        setShowNotGrantedMessage(true);
        trackEvent("github_student_verification_failed");
      }
    } catch (error) {
      console.log("Error during GitHub Student Pack activation:", error);
      setShowNotGrantedMessage(true);
      trackEvent("github_student_verification_failed");
    } finally {
      setIsLoading(false);
    }
  }, [appMode, navigate, user.details?.profile?.email]);

  const handleAppSignin = useCallback(() => {
    dispatch(
      globalActions.toggleActiveModal({
        modalName: "authModal",
        newValue: true,
        newProps: {
          authMode: APP_CONSTANTS.AUTH.ACTION_LABELS.LOG_IN,
          redirectURL: window.location.href,
          eventSource: "github_student_pack",
          callback: () => {
            handleGithubAuthorization();
          },
        },
      })
    );
    return;
  }, [handleGithubAuthorization, dispatch]);

  const handleGithubSignIn = useCallback(async () => {
    if (!user.loggedIn) {
      handleAppSignin();
      return;
    }

    handleGithubAuthorization();
  }, [handleGithubAuthorization, handleAppSignin, user.loggedIn]);

  if (showNotGrantedMessage) {
    return (
      <div className="gh-student-pack">
        <div className="gh-student-pack-container">
          <div className="gh-student-pack-image">
            <img
              src={"/assets/media/common/gh-student-pack-not-eligible.svg"}
              alt="github-student-pack"
              height={34}
              width={144}
            />
          </div>
          <div className="gh-student-pack-title">You're not currently eligible for the Student Pack</div>
          <div className="gh-student-pack-subtitle">
            GitHub hasn't verified your student status yet. Once it's confirmed, you can sign in again with GitHub.
            Until then, you can continue using the app on the free plan.
          </div>
          <div className="gh-student-pack-btn">
            <RQButton
              type="primary"
              className="gh-signin-button"
              onClick={() => {
                redirectToHome(appMode, navigate);
              }}
              loading={isLoading}
              shape="round"
              size="large"
            >
              Continue with free plan
            </RQButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="gh-student-pack">
      <div className="gh-student-pack-container">
        <div className="gh-student-pack-image">
          <img src={"/assets/media/common/gh-student-pack.svg"} alt="github-student-pack" height={80} width={80} />
        </div>
        <div className="gh-student-pack-title">Get Professional plan free with Github Student Pack</div>
        <div className="gh-student-pack-subtitle">
          Verify your student status by signing in with your Github account and enjoy full access to all features.
        </div>
        <div className="gh-student-pack-btn">
          <RQButton
            type="primary"
            className="gh-signin-button"
            onClick={handleGithubSignIn}
            loading={isLoading}
            shape="round"
            size="large"
          >
            <img src={"/assets/media/common/github-white-logo.svg"} alt="github" height={20} width={20} />
            Connect with Github
          </RQButton>
        </div>
      </div>
    </div>
  );
};
