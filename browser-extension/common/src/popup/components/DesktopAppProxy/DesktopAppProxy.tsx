import React, { useCallback, useEffect, useState } from "react";
import { Button, Row } from "antd";
import "./desktopAppProxy.scss";
import { PrimaryActionButton } from "../common/PrimaryActionButton";

interface DesktopAppProxyProps {
  handleToggleExtensionStatus: () => void;
}

const DesktopAppProxy: React.FC<DesktopAppProxyProps> = ({ handleToggleExtensionStatus }) => {
  const [isProxyApplied, setIsProxyApplied] = useState(false);
  const [isDesktopAppConnected, setIsDesktopAppConnected] = useState(false);

  const applyProxy = useCallback(() => {
    chrome.runtime
      .sendMessage({ action: "applyProxy" })
      .then(setIsProxyApplied)
      .catch(() => setIsProxyApplied(false));
  }, []);

  const removeProxy = useCallback(() => {
    chrome.runtime.sendMessage({ action: "disconnectFromDesktopApp" }).then(() => {
      setIsDesktopAppConnected(false);
      setIsProxyApplied(false);
    });
  }, []);

  const checkIfProxyApplied = useCallback(() => {
    chrome.runtime.sendMessage({ action: "getProxyStatus" }).then(setIsProxyApplied);
  }, []);

  const handleDesktopAppConnection = useCallback(() => {
    chrome.runtime.sendMessage({ action: "connectToDesktopApp" }).then((connected) => {
      if (connected) {
        applyProxy();
        setIsDesktopAppConnected(true);
      } else {
        window.open("requestly://open-url");
        setTimeout(() => {
          applyProxy();
        }, 500);
      }
    });
  }, []);

  useEffect(() => {
    checkIfProxyApplied();
  }, []);

  useEffect(() => {});

  return (
    <div className="desktop-app-container">
      <Row align={"middle"} justify={"space-between"}>
        <div className="title">Connect to desktop app</div>
        <div>
          {!isProxyApplied ? (
            <PrimaryActionButton
              size="small"
              onClick={() => {
                console.log("!!!debug", "isAppConnected", { isDesktopAppConnected });
                handleDesktopAppConnection();
                // Apply the proxy and deactivate the extension
              }}
            >
              Connect to desktop app
            </PrimaryActionButton>
          ) : (
            <Button
              onClick={() => {
                removeProxy();
              }}
            >
              Disconnect
            </Button>
          )}
        </div>
      </Row>
    </div>
  );
};

export default DesktopAppProxy;
