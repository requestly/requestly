import { RQButton } from "lib/design-system/components";
import { useCallback } from "react";
import "./AuthForm.css";
import { isEmailValid } from "utils/FormattingHelper";
import { toast } from "utils/Toast";
import { sendEmailLinkForSignin } from "actions/FirebaseActions";
import { useSelector } from "react-redux";
import { getTimeToResendEmailLogin } from "store/selectors";
import { useDispatch } from "react-redux";
import { globalActions } from "store/slices/global/slice";
import { updateTimeToResendEmailLogin } from "./MagicAuthLinkModal/actions";

export default function GenerateEmailAuthLinkBtn({ email, authMode, eventSource, callback }) {
  const timeToResendEmailLogin = useSelector(getTimeToResendEmailLogin);
  const dispatch = useDispatch();

  const startResetTimerAndAnimation = useCallback(() => {
    updateTimeToResendEmailLogin(dispatch, 30);
  }, [dispatch]);

  const handleBtnClick = useCallback(() => {
    if (!email || !isEmailValid(email)) {
      toast.warn("Please enter a valid email");
    } else {
      startResetTimerAndAnimation();
      sendEmailLinkForSignin(email, eventSource).then(() => {
        // open dialog
        dispatch(
          globalActions.toggleActiveModal({
            modalName: "emailLoginLinkPopup",
            newValue: true,
            newProps: {
              email,
              authMode,
              eventSource,
            },
          })
        );
        callback && callback();
      });
    }
  }, [dispatch, email, authMode, eventSource, startResetTimerAndAnimation, callback]);

  return timeToResendEmailLogin > 0 ? (
    <RQButton
      title="please check your email for the login link"
      className="form-elements-margin w-full generate-login-link-btn-animation"
      disabled
    >
      Send link again in {timeToResendEmailLogin} seconds
    </RQButton>
  ) : (
    <RQButton type="primary" className="form-elements-margin w-full" onClick={handleBtnClick}>
      {" "}
      Continue with Email
    </RQButton>
  );
}
