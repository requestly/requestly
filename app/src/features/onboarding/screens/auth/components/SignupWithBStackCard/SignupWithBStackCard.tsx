import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RQButton } from "lib/design-system/components";
import { redirectToOAuthUrl } from "utils/RedirectionUtils";
import { IoMdArrowBack } from "@react-icons/all-files/io/IoMdArrowBack";
import "./signupWithBStackCard.scss";

interface SignupWithBStackCardProps {
  onBackButtonClick: () => void;
}

export const SignupWithBStackCard = ({ onBackButtonClick }: SignupWithBStackCardProps) => {
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);

  const handleCreateBStackAccount = useCallback(() => {
    setIsLoading(true);
    redirectToOAuthUrl(navigate);
  }, [navigate]);

  return (
    <div className="signup-with-bstack-card">
      <div className="onboarding-card-title signup-with-bstack-card-title  text-center">
        <IoMdArrowBack onClick={onBackButtonClick} /> <span>No account found. Create a new account</span>
      </div>
      <div className="signup-with-bstack-card-sub_heading">
        We have not found any account with the provided email. Please sign up for a new free account.
      </div>
      <RQButton loading={isLoading} block size="large" type="primary" onClick={handleCreateBStackAccount}>
        Sign up for new account
      </RQButton>
      <div className="signup-with-bstack-card-description">
        You'll be redirected to the BrowserStack page to complete your sign-up, then returned to the Requestly app.
      </div>
    </div>
  );
};
