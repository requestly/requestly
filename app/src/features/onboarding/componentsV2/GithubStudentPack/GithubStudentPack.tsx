import React, { useCallback, useState } from "react";
import { RQButton } from "lib/design-system-v2/components";
import { githubSignIn } from "actions/FirebaseActions";
import { getFunctions, httpsCallable } from "@firebase/functions";
import { toast } from "utils/Toast";
import { useSelector } from "react-redux";
import "./githubStudentPack.scss";
import { redirectToHome } from "utils/RedirectionUtils";
import { getAppMode } from "store/selectors";
import { useNavigate } from "react-router-dom";

export const GithubStudentPack: React.FC = () => {
  const navigate = useNavigate();

  const appMode = useSelector(getAppMode);

  const [showNotGrantedMessage, setShowNotGrantedMessage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleGithubSignIn = useCallback(async () => {
    setIsLoading(true);

    try {
      const { accessToken } = await githubSignIn(() => {}, "github_student_pack");
      const activateGithubStudentAccess = httpsCallable<
        { code: string },
        { success: boolean; granted: boolean; error: string }
      >(getFunctions(), "auth-activateGithubStudentAccess");
      const result = await activateGithubStudentAccess({ code: accessToken });
      const data = result.data;
      if (data.success) {
        if (data.granted) {
          setShowNotGrantedMessage(false);
          toast.success("Congratulations! You've been granted the Professional plan via the GitHub Student Pack.");
          redirectToHome(appMode, navigate);
        } else {
          setShowNotGrantedMessage(true);
        }
      } else {
        setShowNotGrantedMessage(true);
      }
    } catch (error) {
      console.log("Error during GitHub Student Pack activation:", error);
      setShowNotGrantedMessage(true);
    } finally {
      setIsLoading(false);
    }
  }, [appMode, navigate]);

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
          Verify your student status by signing in with your GitHub account and enjoy full access to all features.
        </div>
        <div className="gh-student-pack-btn">
          <RQButton
            type="primary"
            className="gh-signin-button"
            onClick={handleGithubSignIn}
            loading={isLoading}
            shape="round"
          >
            <img src={"/assets/media/common/github-white-logo.svg"} alt="github" height={20} width={20} />
            Sign in with Github
          </RQButton>
        </div>
      </div>
    </div>
  );
};
