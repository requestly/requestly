import { useEffect, useState } from "react";
import { Row, Space, Typography } from "antd";
import { useSelector } from "react-redux";
import AUTH from "config/constants/sub/auth";
import { getTimeToResendEmailLogin } from "store/selectors";
import { sendEmailLinkForSignin } from "actions/FirebaseActions";
import { updateTimeToResendEmailLogin } from "./actions";
import { useDispatch } from "react-redux";
import { PiEnvelope } from "@react-icons/all-files/pi/PiEnvelope";
import { RQButton } from "lib/design-system/components";
import { FaSpinner } from "@react-icons/all-files/fa/FaSpinner";
import { fetchSignInMethodsForEmail, getAuth } from "firebase/auth";
import firebaseApp from "firebase.js";
import Logger from "lib/logger";
import { toast } from "utils/Toast";
import * as Sentry from "@sentry/react";
import { AUTH_PROVIDERS } from "modules/analytics/constants";
import { SOURCE } from "modules/analytics/events/common/constants";
import { trackLoginAttemptedEvent } from "modules/analytics/events/common/auth/login";
import { trackSignUpAttemptedEvent } from "modules/analytics/events/common/auth/signup";
import { trackMagicLinkResendRequested } from "modules/analytics/events/common/auth/emailLinkSignin";

// HACKY WAY FOR CHECKING IF USER EXISTS
async function doesUserExist(email) {
  try {
    const auth = getAuth(firebaseApp);
    const methods = await fetchSignInMethodsForEmail(auth, email);
    return methods.length > 0;
  } catch (error) {
    // If there is an error, we assume that the user does not exist
    return false;
  }
}

export default function MagicLinkModalContent({ email, authMode, eventSource }) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [isSendingMail, setIsSendingMail] = useState(false);
  const [isLogin, setIsLogin] = useState(authMode === AUTH.ACTION_LABELS.LOG_IN);

  useEffect(() => {
    doesUserExist(email).then((isExistingUser) => {
      setIsLogin(isExistingUser);
      setLoading(false);
      if (isExistingUser) {
        trackLoginAttemptedEvent({
          auth_provider: AUTH_PROVIDERS.EMAIL_LINK,
          source: eventSource ?? SOURCE.MAGIC_LINK,
        });
      } else {
        trackSignUpAttemptedEvent({
          auth_provider: AUTH_PROVIDERS.EMAIL_LINK,
          source: eventSource ?? SOURCE.MAGIC_LINK,
        });
      }
    });
  }, [email, eventSource]);

  const handleEmailSend = () => {
    setIsSendingMail(true);
    trackMagicLinkResendRequested();
    sendEmailLinkForSignin(email, "resend-from-modal", "The email has been resent.")
      .then(() => {
        updateTimeToResendEmailLogin(dispatch, 30);
      })
      .catch((error) => {
        Logger.log(error);
        Sentry.captureException(new Error(`Error sending email link for signin: ${error}`), {
          extra: {
            email,
          },
        });
        toast.error("There was an error sending the email. Please try again later.");
      })
      .finally(() => {
        setIsSendingMail(false);
      });
  };

  const timeToResendEmailLogin = useSelector(getTimeToResendEmailLogin);
  return loading ? (
    <Row className="modal-loader" justify="center">
      <FaSpinner />
    </Row>
  ) : (
    <div className="mail-link-modal-content">
      <PiEnvelope className="mail-icon" />
      {isLogin ? (
        <Typography.Title level={3} className="mail-sent-title">
          Welcome Back
        </Typography.Title>
      ) : (
        <Typography.Title level={3} className="mail-sent-title">
          Please verify your email
        </Typography.Title>
      )}
      <Space direction="vertical" className="mail-link-modal-message">
        <Typography.Text className="text-white">
          We just sent you an email at <strong>{email}</strong>
        </Typography.Text>
        <Typography.Text className="text-white">It contains a link that will sign you super quick!</Typography.Text>
      </Space>
      <br />
      <Typography.Text className="text-white">Didn't receive the email? </Typography.Text>
      {timeToResendEmailLogin > 0 ? (
        <Row className="resend-timeout-text">
          <Typography.Text>{`Send again in ${timeToResendEmailLogin} seconds`}</Typography.Text>
        </Row>
      ) : (
        <RQButton
          loading={isSendingMail}
          className="mt-8"
          onClick={() => {
            handleEmailSend();
          }}
        >
          Click to Resend
        </RQButton>
      )}
    </div>
  );
}
