import { message } from "antd";
import { getFunctions, httpsCallable } from "firebase/functions";

interface ResInterface {
  success: boolean;
  message: string;
  data: object;
}

export default async function sendSlackInvite() {
  const hide = message.loading({
    content: "Sending Slack Connect Invitation",
    className: "slack-connect-toast",
    duration: 0,
  });
  const sendSlackInviation = httpsCallable<null, ResInterface>(getFunctions(), "slackConnect-sendSlackInvitation");
  try {
    const res = await sendSlackInviation();
    if (res.data.success) {
      hide();
      message.success({
        content: res.data.message || "Slack invitation sent successfully",
        className: "slack-connect-toast",
      });
    } else if (!res.data.success) {
      hide();
      message.error({
        content: res.data.message || "Error sending slack invitation",
        className: "slack-connect-toast",
      });
    }
  } catch (err) {
    hide();
    console.error("Error sending slack invitation", err);
  }
}
