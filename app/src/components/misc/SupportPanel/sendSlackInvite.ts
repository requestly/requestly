import { getFunctions, httpsCallable } from "firebase/functions";
import { throttle } from "lodash";
import { toast } from "utils/Toast";

async function sendSlackInvite() {
  toast.loading("Sending Slack Connect Invitation", 0);

  const sendSlackInviation = httpsCallable(getFunctions(), "slackConnect-sendSlackInvitation");
  return sendSlackInviation()
    .then((res: any) => {
      if (res.data.success) {
        toast.success("You'll receive the Slack invite in your email shortly!", 4);
      } else {
        toast.error("Failed to send Slack invite", 4);
      }
    })
    .catch(() => {
      toast.error("Failed to send Slack invite", 4);
    });
}

export default throttle(sendSlackInvite, 5000);
