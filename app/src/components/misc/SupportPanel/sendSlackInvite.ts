import { message } from "antd";
import { getFunctions, httpsCallable } from "firebase/functions";

export default async function sendSlackInvite() {
  const hide = message.loading({
    content: "Sending Slack Connect Invitation",
    className: "slack-connect-toast",
    duration: 0,
  });
  const sendSlackInviation = httpsCallable(getFunctions(), "slackConnect-sendSlackInvitation");
  sendSlackInviation()
    .then((res) => {
      if (res.data) {
        message.success({
          content: "Slack invitation sent successfully",
          className: "slack-connect-toast",
        });
      }
    })
    .catch((err) => {
      console.error("Error sending slack invite", err);
    })
    .finally(hide);
}
