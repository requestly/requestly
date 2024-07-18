import { RQButton } from "lib/design-system/components";
import SlackIcon from "assets/icons/slack.svg?react";
import sendSlackInvite from "components/misc/SupportPanel/sendSlackInvite";
import { useState } from "react";

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
        <span className="link-title">Join Slack</span>
      </RQButton>
    </>
  );
};

export default JoinSlackButton;
