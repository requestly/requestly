import React, { useCallback, useState } from "react";
import APP_CONSTANTS from "config/constants";
import { BiArrowBack } from "@react-icons/all-files/bi/BiArrowBack";
import { RQButton } from "lib/design-system/components";
import { AuthFormInput } from "../AuthFormInput";
import { isEmailValid } from "utils/FormattingHelper";
import { toast } from "utils/Toast";
import { handleForgotPasswordButtonOnClick } from "../../actions";
import "./index.scss";
import { getEmailType } from "utils/mailCheckerUtils";
import { EmailType } from "@requestly/shared/types/common";

interface Props {
  email: string;
  setAuthMode: (authMode: string) => void;
  setEmail: (userEmail: string) => void;
  toggleModal: () => void;
}
export const RequestPasswordResetForm: React.FC<Props> = ({ setAuthMode, email, setEmail, toggleModal }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleRequestPasswordReset = useCallback(
    async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      if (!email) {
        toast.error("Please enter your email");
        return;
      }

      if (!isEmailValid(email)) {
        toast.error("Please enter a valid email");
        return;
      }

      const isDisposable = await getEmailType(email);
      if (isDisposable === EmailType.DESTROYABLE) {
        toast.error("Please enter a valid email address. Temporary or disposable email addresses are not allowed.");
        return;
      }
      handleForgotPasswordButtonOnClick(event, email, setIsLoading, toggleModal);
    },
    [email, toggleModal]
  );

  return (
    <>
      <button
        className="auth-screen-back-btn request-new-password-back-btn"
        onClick={() => {
          setAuthMode(APP_CONSTANTS.AUTH.ACTION_LABELS.SIGN_UP);
        }}
      >
        <BiArrowBack />
        <span>Back</span>
      </button>
      <div className="text-bold text-white header mt-16">Forgot your password?</div>
      <div className="request-new-password-screen-text">
        Enter your email address to reset your password. You may need to check your spam folder or unblock{" "}
        <strong>no-reply@requestly.io</strong>.
      </div>
      <div className="mt-24">
        <AuthFormInput
          id="email"
          value={email}
          onValueChange={(email) => setEmail(email)}
          placeholder="E.g., you@company.com"
          label="Your email"
        />
      </div>
      <RQButton
        block
        size="large"
        type="primary"
        className="request-new-password-btn mt-16"
        loading={isLoading}
        onClick={handleRequestPasswordReset}
      >
        Send reset link
      </RQButton>
    </>
  );
};
