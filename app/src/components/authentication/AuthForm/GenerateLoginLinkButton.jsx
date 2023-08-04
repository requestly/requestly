import { RQButton } from "lib/design-system/components";
import { useCallback, useState } from "react";
import "./AuthForm.css";
import { isEmailValid } from "utils/FormattingHelper";
import { toast } from "utils/Toast";
import { sendEmailLinkForSignin } from "actions/FirebaseActions";

export default function GenerateLoginLinkBtn({
  email,
  text = "Send login link",
  timer = 15,
  callback,
  timerEndCallback,
}) {
  const [isWaiting, setIsWaiting] = useState(false);
  const [remainingTime, setRemainingTime] = useState(timer);

  const startResetTimerAndAnimation = useCallback(() => {
    setIsWaiting(true);

    // timer
    setRemainingTime(timer);
    const interval = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev === 0) {
          setIsWaiting(false);
          clearInterval(interval);
          timerEndCallback && timerEndCallback();
        }
        return prev - 1;
      });
    }, 1000);
  }, [timer, timerEndCallback]);

  const handleBtnClick = useCallback(() => {
    if (!email || !isEmailValid(email)) {
      toast.warn("Please enter a valid email");
    } else {
      startResetTimerAndAnimation();
      callback && callback();
      sendEmailLinkForSignin(email)
        .then((res) => {
          callback(res);
        })
        .catch((err) => {
          console.log("err in link generation", err);
        });
    }
  }, [callback, email, startResetTimerAndAnimation]);

  return isWaiting ? (
    <RQButton
      title="please check your email for the login link"
      className="form-elements-margin w-full generate-login-link-btn-animation"
      disabled
    >
      Send link again in {remainingTime} seconds
    </RQButton>
  ) : (
    <RQButton className="form-elements-margin w-full" onClick={handleBtnClick}>
      {text}
    </RQButton>
  );
}
