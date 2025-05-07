import React, { useCallback, useState } from "react";
import { Button } from "antd";
import { AuthFormInput } from "../AuthFormInput/AuthFormInput";
import { RQButton } from "lib/design-system/components";
import { emailSignIn } from "actions/FirebaseActions";
import { toast } from "utils/Toast";
import { AuthTypes, getAuthErrorMessage } from "components/authentication/utils";
import { getGreeting } from "utils/FormattingHelper";
import { MdOutlineEdit } from "@react-icons/all-files/md/MdOutlineEdit";
import { useAuthScreenContext } from "features/onboarding/screens/auth/context";
import { useLocation } from "react-router-dom";
import PATHS from "config/constants/sub/paths";
import "./emailAuthForm.scss";
import { trackLoginWithPasswordClicked } from "modules/analytics/events/common/auth/signup";

interface EmailAuthFormProps {
  isLoading: boolean;
  onSendEmailClick: () => Promise<void>;
  onEditEmailClick: () => void;
}

export const EmailAuthForm: React.FC<EmailAuthFormProps> = ({ isLoading, onSendEmailClick, onEditEmailClick }) => {
  const location = useLocation();
  const { email, toggleAuthModal, eventSource } = useAuthScreenContext();
  const [password, setPassword] = useState("");
  const [isSignInInProgress, setIsSignInInProgress] = useState(false);
  const isDesktopSignIn = location.pathname.includes(PATHS.AUTH.DEKSTOP_SIGN_IN.RELATIVE);

  const handleSignInWithEmailAndPassword = useCallback(async () => {
    try {
      trackLoginWithPasswordClicked();
      setIsSignInInProgress(true);
      // TODO: Add source
      const { result } = await emailSignIn(email, password, false, eventSource);
      if (result.user.uid) {
        const greatingName = result.user.displayName?.split(" ")?.[0];
        toast.info(greatingName ? `${getGreeting()}, ${greatingName}` : "Welcome back!");
        toggleAuthModal(false);
      }
    } catch (error) {
      toast.error(getAuthErrorMessage(AuthTypes.SIGN_IN, error.errorCode));
    } finally {
      setIsSignInInProgress(false);
    }
  }, [email, password, toggleAuthModal, eventSource]);

  return (
    <div className="email-auth-form-container">
      <div className="rq-auth-entered-email-container">
        <Button
          type="link"
          icon={<MdOutlineEdit />}
          className="rq-auth-edit-entered-email-btn"
          onClick={onEditEmailClick}
        >
          Edit
        </Button>
        <AuthFormInput placeholder="" label="Your work email" value={email} onValueChange={() => {}} disabled />
      </div>
      {isDesktopSignIn ? (
        <AuthFormInput
          placeholder="password"
          label="Password"
          value={password}
          type="password"
          onValueChange={setPassword}
          onPressEnter={handleSignInWithEmailAndPassword}
        />
      ) : null}
      <RQButton
        block
        disabled={isDesktopSignIn && !password.length}
        loading={isLoading || isSignInInProgress}
        className="email-auth-form-signin-btn"
        type="primary"
        // TODO: Add source
        onClick={isDesktopSignIn ? handleSignInWithEmailAndPassword : onSendEmailClick}
        size="large"
      >
        {isDesktopSignIn ? "Sign In" : "Send sign in link"}
      </RQButton>
    </div>
  );
};
