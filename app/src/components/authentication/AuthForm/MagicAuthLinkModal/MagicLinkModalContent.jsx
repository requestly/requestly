import { Space, Typography } from "antd";
import AUTH from "config/constants/sub/auth";
import { useSelector } from "react-redux";
import { getTimeToResendEmailLogin } from "store/selectors";
import { sendEmailLinkForSignin } from "actions/FirebaseActions";
import { updateTimeToResendEmailLogin } from "./actions";
import { useDispatch } from "react-redux";
import { MailOutlined } from "@ant-design/icons";

export default function MagicLinkModalContent({ email, authMode, eventSource }) {
  const dispatch = useDispatch();
  const handleEmailSend = () => {
    sendEmailLinkForSignin(email, "resend-from-modal");
    updateTimeToResendEmailLogin(dispatch, 15);
  };
  const timeToResendEmailLogin = useSelector(getTimeToResendEmailLogin);
  return (
    <div className="mail-link-modal-content">
      <div className="mail-icon">
        <MailOutlined />
      </div>
      {authMode === AUTH.ACTION_LABELS.LOG_IN ? (
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
        <Typography.Text strong>
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
