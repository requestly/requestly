import { RQButton } from "lib/design-system/components";
import SlackIcon from "assets/icons/slack.svg?react";
import sendSlackInvite from "components/misc/SupportPanel/sendSlackInvite";
import { useCallback, useState } from "react";
import { trackSlackConnectClicked } from "modules/analytics/events/misc/UnifiedSupport";
import { useDispatch } from "react-redux";
import { globalActions } from "store/slices/global/slice";
import "./joinSlackButton.scss";
import Logger from "lib/logger";

const JoinSlackButton = () => {
  const dispatch = useDispatch();
  const [isDisabled, setIsDisabled] = useState(false);

  const handleJoinSlack = useCallback(() => {
    setIsDisabled(true);
    sendSlackInvite()
      .then(() => {
        // @ts-ignore
        dispatch(globalActions.updateIsSlackConnectButtonVisible(false));
        trackSlackConnectClicked("sidebar");
      })
      .catch((err) => {
        Logger.error("Failed to send Slack invite", err);
      })
      .finally(() => setIsDisabled(false));
  }, [setIsDisabled]);

  return (
    <>
      <RQButton type="text" onClick={handleJoinSlack} className="primary-sidebar-link w-full" disabled={isDisabled}>
        <span className="icon__wrapper">
          <SlackIcon />
        </span>
        <img src={"/assets/media/Dashboard/Stars.gif"} alt="Star Animation" className="star-animation" />
        <span className="link-title">Join Slack</span>
      </RQButton>
    </>
  );
};

export default JoinSlackButton;
