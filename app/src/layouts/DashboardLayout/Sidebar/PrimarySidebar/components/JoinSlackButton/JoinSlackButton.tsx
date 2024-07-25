import { RQButton } from "lib/design-system/components";
import SlackIcon from "assets/icons/slack.svg?react";
import sendSlackInvite from "components/misc/SupportPanel/sendSlackInvite";
import { useCallback, useState } from "react";
import starAnimation from "assets/images/gifs/Stars.gif";
import "./joinSlackButton.scss";
import { trackSlackConnectClicked } from "modules/analytics/events/misc/UnifiedSupport";

const JoinSlackButton = () => {
  const [isDisabled, setIsDisabled] = useState(false);
  const handleJoinSlack = useCallback(() => {
    setIsDisabled(true);
    return sendSlackInvite()
      .then(() => trackSlackConnectClicked("sidebar"))
      .catch(console.error)
      .finally(() => setIsDisabled(false));
  }, [setIsDisabled]);
  return (
    <>
      <RQButton type="text" onClick={handleJoinSlack} className="primary-sidebar-link w-full" disabled={isDisabled}>
        <span className="icon__wrapper">
          <SlackIcon />
        </span>
        <img src={starAnimation} alt="Star Animation" className="star-animation" />
        <span className="link-title">Join Slack</span>
      </RQButton>
    </>
  );
};

export default JoinSlackButton;
