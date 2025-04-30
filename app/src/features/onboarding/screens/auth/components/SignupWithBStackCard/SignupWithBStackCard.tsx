import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RQButton } from "lib/design-system/components";
import { redirectToOAuthUrl } from "utils/RedirectionUtils";
import { IoMdArrowBack } from "@react-icons/all-files/io/IoMdArrowBack";
import { useAuthScreenContext } from "../../context";
import "./signupWithBStackCard.scss";

interface SignupWithBStackCardProps {
  onBackButtonClick: () => void;
}

export const SignupWithBStackCard = ({ onBackButtonClick }: SignupWithBStackCardProps) => {
  const navigate = useNavigate();
  const { email } = useAuthScreenContext();

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
      <div className="signup-with-bstack-card-description">
        We couldn’t find an account associated with "{email.trim()}". Please sign up to create a new one.
      </div>
      <RQButton loading={isLoading} block size="large" type="primary" onClick={handleCreateBStackAccount}>
        Sign up
      </RQButton>
    </div>
  );
};
