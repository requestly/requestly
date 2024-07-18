import { RQButton } from "lib/design-system/components";
import SlackIcon from "assets/icons/slack.svg?react";
import sendSlackInvite from "components/misc/SupportPanel/sendSlackInvite";
import { useState } from "react";
import starAnimation from "assets/images/gifs/Stars.gif";
import "./joinSlackButton.scss";
const JoinSlackButton = () => {
  const [disabled, setDisabled] = useState(false);
  return (
    <>
      <RQButton
        type="text"
        onClick={async () => {
          setDisabled(true);
          await sendSlackInvite();
          setDisabled(false);
        }}
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
