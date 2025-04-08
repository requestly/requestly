import React, { useCallback, useState } from "react";
import { useSelector } from "react-redux";
import { getAppMode } from "store/selectors";
import { Button } from "antd";
import { AuthFormInput } from "../AuthFormInput/AuthFormInput";
import { RQButton } from "lib/design-system/components";
import { emailSignIn } from "actions/FirebaseActions";
import { toast } from "utils/Toast";
import { AuthTypes, getAuthErrorMessage } from "components/authentication/utils";
import { getGreeting } from "utils/FormattingHelper";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import { MdOutlineEdit } from "@react-icons/all-files/md/MdOutlineEdit";
import { AuthProvider } from "features/onboarding/screens/auth/types";
import "./emailAuthForm.scss";

interface EmailAuthFormProps {
  email: string;
  isLoading: boolean;
  authProviders: AuthProvider[];
  onSendEmailClick: () => Promise<void>;
  onEditEmailClick: () => void;
  toggleAuthModal: () => void;
}

export const EmailAuthForm: React.FC<EmailAuthFormProps> = ({
  email,
  isLoading,
  authProviders,
  onSendEmailClick,
  onEditEmailClick,
  toggleAuthModal,
}) => {
  const appMode = useSelector(getAppMode);
  const [password, setPassword] = useState("");
  const [isSignInInProgress, setIsSignInInProgress] = useState(false);

  const handleSignInWithEmailAndPassword = useCallback(async () => {
    try {
      setIsSignInInProgress(true);
      // TODO: Add source
      const { result } = await emailSignIn(email, password, false, "");
      if (result.user.uid) {
        const greatingName = result.user.displayName?.split(" ")?.[0];
        toast.info(greatingName ? `${getGreeting()}, ${greatingName}` : "Welcome back!");
        toggleAuthModal();
      }
    } catch (error) {
      toast.error(getAuthErrorMessage(AuthTypes.SIGN_IN, error.errorCode));
    } finally {
      setIsSignInInProgress(false);
    }
  }, [email, password, toggleAuthModal]);

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
      {appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP ? (
        <AuthFormInput
          placeholder=""
          label="Password"
          value={password}
          onValueChange={setPassword}
          onPressEnter={handleSignInWithEmailAndPassword}
        />
      ) : null}
      <RQButton
        block
        disabled={appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP && !password.length}
        loading={isLoading || isSignInInProgress}
        className="email-auth-form-signin-btn"
        type="primary"
        // TODO: Add source
        onClick={appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP ? handleSignInWithEmailAndPassword : onSendEmailClick}
        size="large"
      >
        {appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP ? "Sign In" : "Continue with email"}
      </RQButton>
    </div>
  );
};
