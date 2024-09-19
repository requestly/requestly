import { RQButton } from "lib/design-system/components";
import SlackIcon from "assets/icons/slack.svg?react";
import sendSlackInvite from "components/misc/SupportPanel/sendSlackInvite";
import { useCallback, useState } from "react";
import starAnimation from "assets/images/gifs/Stars.gif";
import { trackSlackConnectClicked } from "modules/analytics/events/misc/UnifiedSupport";
import { useDispatch } from "react-redux";
import { actions } from "store";
import "./joinSlackButton.scss";

const JoinSlackButton = () => {
  const dispatch = useDispatch();
  const [isDisabled, setIsDisabled] = useState(false);

  const handleJoinSlack = useCallback(() => {
    setIsDisabled(true);
    sendSlackInvite()
      .then(() => {
        // @ts-ignore
        dispatch(actions.updateIsSlackConnectButtonVisible(false));
        trackSlackConnectClicked("sidebar");
      })
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
