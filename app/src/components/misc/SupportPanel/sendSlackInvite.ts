import { message } from "antd";
import { getFunctions, httpsCallable } from "firebase/functions";
import { throttle } from "lodash";

async function sendSlackInvite() {
  const hide = message.loading({
    content: "Sending Slack Connect Invitation",
    className: "slack-connect-toast",
    duration: 0,
  });

  const sendSlackInviation = httpsCallable(getFunctions(), "slackConnect-sendSlackInvitation");
  sendSlackInviation()
    .then((res: any) => {
      if (res.data.success) {
        message.success({
          content: "You'll receive the Slack invite in your email shortly!",
          className: "slack-connect-toast",
          duration: 4,
        });
      }
    })
    .catch(() => {
      message.error({
        content: "Failed to send Slack invite",
        className: "slack-connect-toast",
        duration: 4,
      });
    })
    .finally(hide);
}

export default throttle(sendSlackInvite, 5000);
