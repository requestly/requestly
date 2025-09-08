import React, { useCallback, useMemo, useState } from "react";
import { NudgePrompt } from "componentsV2/Nudge/NudgePrompt";
import { RQButton } from "lib/design-system-v2/components";
import { githubSignIn } from "actions/FirebaseActions";
import { getFunctions, httpsCallable } from "@firebase/functions";
import { toast } from "utils/Toast";
import { useSelector } from "react-redux";
import { getUserAuthDetails } from "store/slices/global/user/selectors";

export const GithubStudentPack: React.FC = () => {
  const user = useSelector(getUserAuthDetails);
  const [notGrantedMessage, setNotGrantedMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isStudentPlanActive = useMemo(() => {
    return user?.details?.planDetails?.type === "student";
  }, [user]);

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
          toast.success(
            "Github Student Developer Pack access granted! You now have access to Requestly's Student Plan."
          );
        } else {
          setNotGrantedMessage(
            "You are not eligible for Github Student Developer Pack. If you believe this is an error, please contact support."
          );
        }
      }
    } catch (error) {
      console.log("Error during GitHub Student Pack activation:", error);
      toast.error(
        "An error occurred while activating GitHub Student Pack. Please contact support if the issue persists."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const promptButtons = useMemo(() => {
    if (isStudentPlanActive || notGrantedMessage) {
      return [];
    }
    return [
      <RQButton
        type="secondary"
        className="onboarding-google-auth-button"
        onClick={handleGithubSignIn}
        loading={isLoading}
      >
        <img src={"/assets/media/common/github-white-logo.svg"} alt="github" height={24} width={24} />
        Connect with Github
      </RQButton>,
    ];
  }, [handleGithubSignIn, isLoading, isStudentPlanActive, notGrantedMessage]);

  return (
    <div className="coming-soon-view-full">
      <NudgePrompt icon="/assets/media/common/feature-disabled.svg" buttons={promptButtons}>
        {notGrantedMessage ? (
          <div className="coming-soon-title">{notGrantedMessage}</div>
        ) : (
          <>
            <div className="coming-soon-title">
              {isStudentPlanActive
                ? "You have an active Requestly Student Plan"
                : "Thank you for the interest in Requestly as part of Github Student Developer Pack"}
            </div>
            {!isStudentPlanActive && (
              <div className="coming-soon-description">Please connect your Github account to proceed further.</div>
            )}
          </>
        )}
      </NudgePrompt>
    </div>
  );
};
