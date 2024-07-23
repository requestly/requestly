import { CloseOutlined, SlackOutlined } from "@ant-design/icons";
import { Badge, Button, Dropdown } from "antd";
import { useMemo, useState } from "react";
import { PiChatTeardropTextFill } from "@react-icons/all-files/pi/PiChatTeardropTextFill";
import { BsFillChatLeftTextFill } from "@react-icons/all-files/bs/BsFillChatLeftTextFill";
import { PiRedditLogo } from "@react-icons/all-files/pi/PiRedditLogo";
import BotIcon from "layouts/DashboardLayout/MenuHeader/assets/bot.svg?react";
import { TbMailForward } from "@react-icons/all-files/tb/TbMailForward";

import "./supportPanel.scss";
import { getIsSupportChatOpened, getUserAuthDetails } from "store/selectors";
import { useDispatch, useSelector } from "react-redux";
import { actions } from "store";
import { RequestBot } from "features/requestBot";
import { useFeatureIsOn } from "@growthbook/growthbook-react";
import useSlackInviteVisibility from "./useSlackInviteVisibility";
import sendSlackInvite from "./sendSlackInvite";
import { trackEvent } from "modules/analytics";
import { trackSupportOptionClicked } from "modules/analytics/events/misc/UnifiedSupport";

const SupportPanel = () => {
  const user = useSelector(getUserAuthDetails);
  const dispatch = useDispatch();
  const [visible, setVisible] = useState(false);
  const [isRequestBotVisible, setIsRequestBotVisible] = useState(false);
  const paidUser = user.loggedIn && user.details?.isPremium;
  const slackConnect = useFeatureIsOn("slack_connect");
  const slackInviteVisibilityStatus = useSlackInviteVisibility();
  const isSupportChatOpened = useSelector(getIsSupportChatOpened);
  const supportItems = useMemo(
    () =>
      [
        slackConnect &&
          slackInviteVisibilityStatus && {
            key: "1",
            label: (
              <div
                className="support-panel-item-style"
                onClick={() => {
                  setVisible(false);
                  sendSlackInvite();
                  trackSupportOptionClicked("slack");
                  trackEvent("join_slack_connect_clicked", {
                    source: "support_option",
                  });
                }}
              >
                <span className="support-panel-label-style">Ask us on Slack</span>
              </div>
            ),
            icon: <SlackOutlined className="support-panel-icon-style" />,
          },
        {
          key: "2",
          label: (
            <a
              href="https://www.reddit.com/r/requestly/"
              target="_blank"
              rel="noreferrer"
              className="support-panel-item-style"
              onClick={() => {
                setVisible(false);
                trackSupportOptionClicked("reddit");
              }}
            >
              <span className="support-panel-label-style">Ask us on Reddit</span>
            </a>
          ),
          icon: <PiRedditLogo className="support-panel-icon-style" />,
        },
        {
          key: "3",
          label: (
            <div
              className="support-panel-item-style"
              onClick={() => {
                setVisible(false);
                setIsRequestBotVisible(true);
                trackSupportOptionClicked("ask_ai");
              }}
            >
              <span className="support-panel-label-style">
                Ask AI<i style={{ color: "#bbbbbb" }}> 24x7 Support</i>
              </span>
            </div>
          ),
          icon: <BotIcon className="support-panel-icon-style" />,
        },
        {
          key: "4",
          label: (
            <div
              className={`support-panel-item-style ${!paidUser && "support-panel-item-disabled"}`}
              onClick={() => {
                if (paidUser) {
                  window.$crisp.push(["do", "chat:open"]);
                  trackSupportOptionClicked("chat_with_us");
                } else {
                  dispatch(
                    // @ts-ignore
                    actions.toggleActiveModal({
                      modalName: "pricingModal",
                      newValue: true,
                      newProps: { selectedPlan: null, source: "support_option_clicked" },
                    })
                  );
                  trackSupportOptionClicked("upgrade_to_chat_with_us");
                }
                paidUser
                  ? window.$crisp.push(["do", "chat:open"])
                  : dispatch(
                      // @ts-ignore
                      actions.toggleActiveModal({
                        modalName: "pricingModal",
                        newValue: true,
                        newProps: { selectedPlan: null, source: "support_option_clicked" },
                      })
                    );
              }}
            >
              <span className="support-panel-label-style ">
                Chat With Us
                {!paidUser && <span className="support-panel-upgrade-badge-style">Upgrade</span>}
              </span>
            </div>
          ),
          icon: <BsFillChatLeftTextFill className="support-panel-icon-style" />,
        },

        !slackInviteVisibilityStatus &&
          user.loggedIn &&
          !paidUser && {
            key: "5",
            label: (
              <a
                href="mailto:contact@requestly.io"
                target="_blank"
                rel="noreferrer"
                className="support-panel-item-style"
                onClick={() => {
                  setVisible(false);
                  trackSupportOptionClicked("send_message");
                }}
              >
                <span className="support-panel-label-style ">Send Message</span>
              </a>
            ),
            icon: <TbMailForward className="support-panel-icon-style" />,
          },
      ].filter(Boolean),
    [dispatch, paidUser, slackConnect, slackInviteVisibilityStatus, user.loggedIn]
  );
  return (
    <div className="support-panel-container">
      <Dropdown
        menu={{ items: supportItems }}
        trigger={["click"]}
        onOpenChange={(state) => setVisible(state)}
        dropdownRender={(menu) => {
          return <div className="support-panel-dropown-container">{menu}</div>;
        }}
      >
        <Badge dot={!isSupportChatOpened} size="small">
          <Button
            type="primary"
            size="large"
            shape="circle"
            icon={
              visible || isRequestBotVisible ? (
                <CloseOutlined />
              ) : (
                <PiChatTeardropTextFill className="support-panel-icon-style " />
              )
            }
            onClick={() => {
              if (visible) window?.$crisp.push(["do", "chat:close"]);
              if (isRequestBotVisible) setIsRequestBotVisible(false);
              dispatch(
                // @ts-ignore
                actions.updateIsSupportChatOpened(true)
              );
            }}
          />
        </Badge>
      </Dropdown>
      <RequestBot
        isOpen={isRequestBotVisible}
        onClose={() => {
          setIsRequestBotVisible(false);
        }}
      />
    </div>
  );
};

export default SupportPanel;
