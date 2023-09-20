import { Space, Typography } from "antd";
import AUTH from "config/constants/sub/auth";
import { useSelector } from "react-redux";
import { getTimeToResendEmailLogin } from "store/selectors";
import { sendEmailLinkForSignin } from "actions/FirebaseActions";
import { updateTimeToResendEmailLogin } from "./actions";
import { useDispatch } from "react-redux";
import { MailOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { FaSpinner } from "@react-icons/all-files/fa/FaSpinner";

function doesUserExist(email) {
  // todo: check if email already exists
  return true;
}

export default function MagicLinkModalContent({ email, authMode, eventSource }) {
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(true);
  const [isLogin, setIsLogin] = useState(authMode === AUTH.ACTION_LABELS.LOG_IN);

  useEffect(() => {
    setIsLogin(doesUserExist(email));
    setLoading(false);
  }, [email]);

  const handleEmailSend = () => {
    sendEmailLinkForSignin(email, "resend-from-modal", "The email has been resent.");
    updateTimeToResendEmailLogin(dispatch, 15);
  };
  const timeToResendEmailLogin = useSelector(getTimeToResendEmailLogin);
  return loading ? (
    <FaSpinner />
  ) : (
    <div className="mail-link-modal-content">
      <div className="mail-icon">
        <MailOutlined />
      </div>
      {isLogin ? (
        <div>
          <Typography.Title level={2} className="mail-sent-title">
            Welcome Back
          </Typography.Title>
          <Space direction="vertical" className="mail-link-modal-message">
            <Typography.Text>We just sent a magic link to</Typography.Text>
            <Typography.Text strong>{email}</Typography.Text>
            <Typography.Text>for you to access your account</Typography.Text>
          </Space>
        </div>
      ) : (
        <div>
          <Typography.Title level={2} className="mail-sent-title">
            Verify your email
          </Typography.Title>
          <Space direction="vertical" className="mail-link-modal-message">
            <Typography.Text>We just sent you an email at</Typography.Text>
            <Typography.Text strong>{email}</Typography.Text>
            <Typography.Text> It contains a link that will sign you super quick!</Typography.Text>
          </Space>
        </div>
      )}
      <br />
      <Typography.Text>
        Didn't recieve the email?{" "}
        <Typography.Text strong underline>
          {timeToResendEmailLogin > 0 ? (
            `Send again in ${timeToResendEmailLogin} seconds`
          ) : (
            <span
              className="resend-email-cta"
              onClick={() => {
                handleEmailSend();
              }}
            >
              Click to Resend
            </span>
          )}
        </Typography.Text>
      </Typography.Text>
    </div>
  );
}
