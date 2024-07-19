import { RQButton } from "lib/design-system/components";
import SlackIcon from "assets/icons/slack.svg?react";
import sendSlackInvite from "components/misc/SupportPanel/sendSlackInvite";
import React, { useState } from "react";
import starAnimation from "assets/images/gifs/Stars.gif";
import "./joinSlackButton.scss";
import { trackSlackConnectClicked } from "modules/analytics/events/misc/UnifiedSupport";

const handleJoinSlack = async (setDisabled: React.Dispatch<React.SetStateAction<boolean>>) => {
  setDisabled(true);
  try {
    await sendSlackInvite();
    trackSlackConnectClicked("Sidebar");
    setDisabled(false);
  } catch (err) {
    console.error(err);
    setDisabled(false);
  }
};

const JoinSlackButton = () => {
  const [disabled, setDisabled] = useState(false);
  return (
    <>
      <RQButton
        type="text"
        onClick={() => handleJoinSlack(setDisabled)}
        className="primary-sidebar-link w-full"
        disabled={disabled}
      >
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
