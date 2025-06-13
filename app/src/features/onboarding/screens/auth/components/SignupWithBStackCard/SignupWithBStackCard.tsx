import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RQButton } from "lib/design-system/components";
import { redirectToOAuthUrl } from "utils/RedirectionUtils";
import { IoMdArrowBack } from "@react-icons/all-files/io/IoMdArrowBack";
import { useAuthScreenContext } from "../../context";
import { trackAuthModalShownEvent } from "modules/analytics/events/common/auth/authModal";
import "./signupWithBStackCard.scss";
import { AuthScreenMode } from "../../types";
import { trackSignUpButtonClicked } from "modules/analytics/events/common/auth/signup";
import { setRedirectMetadata } from "features/onboarding/utils";

interface SignupWithBStackCardProps {
  onBackButtonClick: () => void;
}

export const SignupWithBStackCard = ({ onBackButtonClick }: SignupWithBStackCardProps) => {
  const navigate = useNavigate();
  const { email, authScreenMode, eventSource, redirectURL } = useAuthScreenContext();

  const [isLoading, setIsLoading] = useState(false);

  const handleCreateBStackAccount = useCallback(() => {
    trackSignUpButtonClicked(`no_account_found`);
    setIsLoading(true);
    setRedirectMetadata({ source: eventSource, redirectURL });
    redirectToOAuthUrl(navigate);
  }, [navigate, eventSource, redirectURL]);

  useEffect(() => {
    if (authScreenMode === AuthScreenMode.MODAL) {
      trackAuthModalShownEvent(eventSource, "signup");
    }
  }, [authScreenMode, eventSource]);

  return (
    <div className="signup-with-bstack-card">
      <div className="onboarding-card-title signup-with-bstack-card-title  text-center">
        <IoMdArrowBack onClick={onBackButtonClick} /> <span>No account found. Create a new account</span>
      </div>
      <div className="signup-with-bstack-card-description">
        We couldn’t find an account associated with "{email.trim()}". Please sign up to create a new one.
      </div>
      <RQButton loading={isLoading} block size="large" type="primary" onClick={handleCreateBStackAccount}>
        Sign up
      </RQButton>
    </div>
  );
};
