import React, { useCallback, useEffect } from "react";
import { Row } from "antd";
import { PrimaryActionButton } from "../common/PrimaryActionButton";
import { CheckCircleOutlined } from "@ant-design/icons";
import { EXTENSION_MESSAGES } from "../../../constants";
import ConnectToDesktopIcon from "../../../../resources/icons/connectToDesktop.svg";
import "./desktopAppProxy.scss";

interface DesktopAppProxyProps {
  isProxyApplied: boolean;
  onProxyStatusChange: (newStatus: boolean) => void;
  isDesktopAppOpen: boolean;
}

const DesktopAppProxy: React.FC<DesktopAppProxyProps> = ({ isProxyApplied, onProxyStatusChange, isDesktopAppOpen }) => {
  const connectToDesktopApp = useCallback(() => {
    chrome.runtime
      .sendMessage({ action: EXTENSION_MESSAGES.CONNECT_TO_DESKTOP_APP })
      .then(onProxyStatusChange)
      .catch(() => onProxyStatusChange(false));
  }, []);

  const checkIfProxyApplied = useCallback(() => {
    chrome.runtime.sendMessage({ action: EXTENSION_MESSAGES.IS_PROXY_APPLIED }).then(onProxyStatusChange);
  }, []);

  useEffect(() => {
    checkIfProxyApplied();
  }, []);

  if (!isDesktopAppOpen && !isProxyApplied) {
    return null;
  }

  return (
    <div className="desktop-app-container popup-body-card">
      <Row align={"middle"} justify={"space-between"}>
        <ConnectToDesktopIcon className="connect-to-desktop-icon" />
        <div>
          <div>
            {isProxyApplied ? (
              <>
                <CheckCircleOutlined className="connected-icon" /> Connected to Desktop App
              </>
            ) : (
              "Connect to Desktop App"
            )}
          </div>
          <div className="proxy-applied-subtitle">
            {isProxyApplied
              ? "All the traffic from this browser profile is being intercepted."
              : "Connect to intercept all the traffic from this browser profile."}
          </div>
        </div>
        <PrimaryActionButton
          size="small"
          onClick={() => {
            connectToDesktopApp();
          }}
        >
          Connect
        </PrimaryActionButton>
      </Row>
    </div>
  );
};

export default DesktopAppProxy;
