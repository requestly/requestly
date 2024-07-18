import { CloseOutlined, RedditOutlined, SlackOutlined } from "@ant-design/icons";
import { Badge, Button, Dropdown } from "antd";
import { useState } from "react";
import ChatIcon from "assets/icons/chat.svg?react";
import MessageIcon from "assets/icons/message.svg?react";
import AILogo from "assets/icons/ai-logo.svg?react";
import SendMessage from "assets/icons/send-message.svg?react";

import "./supportPanel.scss";
import { getIsSupportChatOpened, getUserAuthDetails } from "store/selectors";
import { useDispatch, useSelector } from "react-redux";
import { actions } from "store";
import { RequestBot } from "features/requestBot";
import { useFeatureIsOn } from "@growthbook/growthbook-react";
import useSlackInviteVisibility from "./useSlackInviteVisibility";
import sendSlackInvite from "./sendSlackInvite";
import { trackEvent } from "modules/analytics";

const SupportPanel = () => {
  const user = useSelector(getUserAuthDetails);
  const dispatch = useDispatch();
  const [visible, setVisible] = useState(false);
  const [isRequestBotVisible, setIsRequestBotVisible] = useState(false);
  const paidUser = user.loggedIn && user?.details?.planDetails?.planName !== "free";
  const slackConnect = useFeatureIsOn("slack_connect");
  const slackInviteVisibilityStatus = useSlackInviteVisibility();
  const isSupportChatOpened = useSelector(getIsSupportChatOpened);
  const supportItems = [
    slackConnect &&
      slackInviteVisibilityStatus && {
        key: "1",
        label: (
          <div
            className="support-panel-item-style"
            onClick={() => {
              setVisible(false);
              sendSlackInvite();
              trackEvent("support_option_clicked", {
                type: "slack",
              });
              trackEvent("join_slack_connect_clicked", {
                source: "support_option",
              });
            }}
          >
            <span className="support-panel-label-style">Ask us on Slack</span>
          </div>
        ),
        icon: <SlackOutlined />,
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
            trackEvent("support_option_clicked", {
              type: "reddit",
            });
          }}
        >
          <span className="support-panel-label-style">Ask us on Reddit</span>
        </a>
      ),
      icon: <RedditOutlined />,
    },
    {
      key: "3",
      label: (
        <div
          className="support-panel-item-style"
          onClick={() => {
            setVisible(false);
            setIsRequestBotVisible(true);
            trackEvent("support_option_clicked", {
              type: "ask_ai",
            });
          }}
        >
          <span className="support-panel-label-style">
            Ask AI<i style={{ color: "#bbbbbb" }}> 24x7 Support</i>
          </span>
        </div>
      ),
      icon: <AILogo />,
    },
    {
      key: "4",
      label: (
        <div
          className={`support-panel-item-style ${!paidUser && "support-panel-item-disabled"}`}
          onClick={() => {
            if (paidUser) {
              window.$crisp.push(["do", "chat:open"]);
              trackEvent("support_option_clicked", {
                type: "chat_with_us",
              });
            } else {
              dispatch(
                // @ts-ignore
                actions.toggleActiveModal({
                  modalName: "pricingModal",
                  newValue: true,
                  newProps: { selectedPlan: null, source: "support_option_clicked" },
                })
              );
              trackEvent("support_option_clicked", {
                type: "upgrade_to_chat_with_us",
              });
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
      icon: <MessageIcon />,
    },
    !slackConnect &&
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
              trackEvent("support_option_clicked", {
                type: "send_message",
              });
            }}
          >
            <span className="support-panel-label-style ">Send Message</span>
          </a>
        ),
        icon: <SendMessage />,
      },
  ];
  return (
    <div className="support-panel-container">
      <Dropdown menu={{ items: supportItems }} trigger={["click"]} onOpenChange={(state) => setVisible(state)}>
        <Badge dot={!isSupportChatOpened} size="small">
          <Button
            type="primary"
            size="large"
            shape="circle"
            icon={
              visible || isRequestBotVisible ? <CloseOutlined /> : <ChatIcon className="support-panel-icon-style " />
            }
            style={{ fontSize: "1rem" }}
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
