import React, { useCallback, useEffect, useState } from "react";
import { Row } from "antd";
import { PrimaryActionButton } from "../common/PrimaryActionButton";
import { CheckCircleOutlined } from "@ant-design/icons";
import "./desktopAppProxy.scss";
import { EXTENSION_MESSAGES } from "../../../constants";

const DesktopAppProxy: React.FC = () => {
  const [isProxyApplied, setIsProxyApplied] = useState(false);
  const [isDesktopAppOpen, setIsDesktopAppOpen] = useState(false);

  const connectToDesktopApp = useCallback(() => {
    chrome.runtime
      .sendMessage({ action: EXTENSION_MESSAGES.CONNECT_TO_DESKTOP_APP })
      .then(setIsProxyApplied)
      .catch(() => setIsProxyApplied(false));
  }, []);

  const disconnectFromDesktopApp = useCallback(() => {
    chrome.runtime
      .sendMessage({ action: EXTENSION_MESSAGES.DISCONNECT_FROM_DESKTOP_APP })
      .then((response) => setIsProxyApplied(!response))
      .catch(() => setIsProxyApplied(true));
  }, []);

  const checkIfProxyApplied = useCallback(() => {
    chrome.runtime.sendMessage({ action: EXTENSION_MESSAGES.IS_PROXY_APPLIED }).then(setIsProxyApplied);
  }, []);

  const checkIfDesktopAppOpen = useCallback(() => {
    chrome.runtime.sendMessage({ action: EXTENSION_MESSAGES.CHECK_IF_DESKTOP_APP_OPEN }).then(setIsDesktopAppOpen);
  }, []);

  useEffect(() => {
    checkIfDesktopAppOpen();
    checkIfProxyApplied();
  }, []);

  if (!isDesktopAppOpen && !isProxyApplied) {
    return null;
  }

  return (
    <div className="desktop-app-container">
      {isDesktopAppOpen ? (
        <Row align={"middle"} justify={"space-between"}>
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
          <div>
            {isProxyApplied ? (
              <PrimaryActionButton
                size="small"
                onClick={() => {
                  disconnectFromDesktopApp();
                }}
                className="disconnect-button"
              >
                Disconnect
              </PrimaryActionButton>
            ) : (
              <PrimaryActionButton
                size="small"
                onClick={() => {
                  connectToDesktopApp();
                }}
              >
                Connect
              </PrimaryActionButton>
            )}
          </div>
        </Row>
      ) : (
        <Row align={"middle"} justify={"space-between"}>
          <div className="title">Please open the desktop app to connect this browser profile</div>
        </Row>
      )}
    </div>
  );
};

export default DesktopAppProxy;
