import React, { useCallback, useEffect, useState } from "react";
import { Row } from "antd";
import "./desktopAppProxy.scss";
import { PrimaryActionButton } from "../common/PrimaryActionButton";
import { CheckCircleOutlined } from "@ant-design/icons";

interface DesktopAppProxyProps {
  handleToggleExtensionStatus: (newStatus?: boolean) => void;
  isExtensionEnabled: boolean;
}

const DesktopAppProxy: React.FC<DesktopAppProxyProps> = ({ handleToggleExtensionStatus, isExtensionEnabled }) => {
  const [isProxyApplied, setIsProxyApplied] = useState(false);
  const [isDesktopAppOpen, setIsDesktopAppOpen] = useState(false);

  const applyProxy = useCallback(() => {
    chrome.runtime
      .sendMessage({ action: "applyProxy" })
      .then(setIsProxyApplied)
      .then(() => handleToggleExtensionStatus(false))
      .catch(() => setIsProxyApplied(false));
  }, []);

  const removeProxy = useCallback(() => {
    chrome.runtime
      .sendMessage({ action: "disconnectFromDesktopApp" })
      .then(() => {
        setIsProxyApplied(false);
      })
      .then(() => handleToggleExtensionStatus(true));
  }, []);

  const checkIfProxyApplied = useCallback(() => {
    chrome.runtime.sendMessage({ action: "getProxyStatus" }).then(setIsProxyApplied);
  }, []);

  const handleDesktopAppConnection = useCallback(() => {
    chrome.runtime.sendMessage({ action: "connectToDesktopApp" }).then((connected) => {
      if (connected) {
        applyProxy();
      }
    });
  }, []);

  const checkIfDesktopAppOpen = useCallback(() => {
    chrome.runtime.sendMessage({ action: "checkIfDesktopAppOpen" }).then(setIsDesktopAppOpen);
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
                  removeProxy();
                }}
                className="disconnect-button"
              >
                Disconnect
              </PrimaryActionButton>
            ) : (
              <PrimaryActionButton
                size="small"
                onClick={() => {
                  handleDesktopAppConnection();
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
