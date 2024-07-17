import { CloseOutlined, RedditOutlined, SlackOutlined } from "@ant-design/icons";
import { Badge, Button, Dropdown } from "antd";
import { useState } from "react";
import ChatIcon from "assets/icons/chat.svg?react";
import MessageIcon from "assets/icons/message.svg?react";
import AILogo from "assets/icons/ai-logo.svg?react";
import SendMessage from "assets/icons/send-message.svg?react";

import "./supportPanel.scss";
import { getUserAuthDetails } from "store/selectors";
import { useDispatch, useSelector } from "react-redux";
import { actions } from "store";
import { RequestBot } from "features/requestBot";

const SupportPanel = () => {
  const user = useSelector(getUserAuthDetails);
  const dispatch = useDispatch();
  const [visible, setVisible] = useState(false);
  const [isRequestBotVisible, setIsRequestBotVisible] = useState(false);
  const paidUser = user.loggedIn && user?.details?.planDetails?.planName !== "free";

  const supportItems = [
    paidUser && {
      key: "1",
      label: (
        <div
          className="support-panel-item-style"
          onClick={() => {
            setVisible(false);
          }}
        >
          <SlackOutlined className="support-panel-icon-style" />
          <span className="support-panel-label-style">Ask us on Slack</span>
        </div>
      ),
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
          }}
        >
          <RedditOutlined className="support-panel-icon-style" />
          <span className="support-panel-label-style">Ask us on Reddit</span>
        </a>
      ),
    },
    {
      key: "3",
      label: (
        <div
          className="support-panel-item-style"
          onClick={() => {
            setVisible(false);
            setIsRequestBotVisible(true);
          }}
        >
          <AILogo className="support-panel-icon-style" />
          <span className="support-panel-label-style">
            Ask AI<i style={{ color: "#bbbbbb" }}> 24x7 Support</i>
          </span>
        </div>
      ),
    },
    {
      key: "4",
      label: (
        <div
          className={`support-panel-item-style ${!paidUser && "support-panel-item-disabled"}`}
          onClick={() => {
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
          <MessageIcon className="support-panel-icon-style" />
          <span className="support-panel-label-style ">
            Chat With Us
            {!paidUser && <span className="support-panel-upgrade-badge-style">Upgrade</span>}
          </span>
        </div>
      ),
    },
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
            }}
          >
            <SendMessage className="support-panel-icon-style" />
            <span className="support-panel-label-style ">Send Message</span>
          </a>
        ),
      },
  ];
  return (
    <div className="support-panel-container">
      <Dropdown
        menu={{ items: supportItems }}
        trigger={["click"]}
        onOpenChange={(state) => setVisible(state)}
        overlayStyle={{}}
      >
        <Badge dot={!visible} size="small">
          <Button
            type="primary"
            size="large"
            shape="circle"
            icon={visible ? <CloseOutlined /> : <ChatIcon className="support-panel-icon-style" />}
            style={{ fontSize: "1rem" }}
            onClick={() => {
              if (visible) window.$crisp.push(["do", "chat:close"]);
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
