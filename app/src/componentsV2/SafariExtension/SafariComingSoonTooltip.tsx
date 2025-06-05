import { Popconfirm } from "antd";
import React from "react";
import "./safariComingSoonTooltip.scss";

export const SafariComingSoonTooltip: React.FC<{ children: any; isVisible: boolean }> = ({ children, isVisible }) => {
  return (
    <Popconfirm
      overlayClassName="safari-comingsoon-tooltip"
      title={
        <span>
          Only the API Client works on Safari. Other
          <br />
          features are coming soon—stay tuned! 🚀
          <br />
          <br />
          Use the desktop app or Chrome browser to <br />
          access full functionality. 🚀
        </span>
      }
      okText={`Download app`}
      cancelText={`Chrome extension`}
      placement="right"
      trigger="hover"
      disabled={!isVisible}
      icon={null}
      onConfirm={() => {
        window.open("https://rqst.ly/chrome-store");
      }}
      onCancel={() => {
        window.open("https://requestly.com/downloads/");
      }}
    >
      {children}
    </Popconfirm>
  );
};
