import React, { useCallback } from "react";
import { Button } from "antd";
import ConnectedToDesktopIcon from "../../../../../../resources/icons/connectedToDesktop.svg";
import "./connectedToDesktopView.scss";
import { EXTENSION_MESSAGES } from "src/constants";

interface ConnectedToDesktopViewProps {
  onDisconnectClick: () => void;
}

export const ConnectedToDesktopView = ({ onDisconnectClick }: ConnectedToDesktopViewProps) => {
  const handleDisconnectFromDesktopApp = useCallback(() => {
    chrome.runtime
      .sendMessage({ action: EXTENSION_MESSAGES.DISCONNECT_FROM_DESKTOP_APP })
      .then(onDisconnectClick)
      .catch(onDisconnectClick);
  }, []);
  return (
    <div className="desktop-app-connected-view">
      <ConnectedToDesktopIcon className="connected-icon" />
      <div className="connected-title">Connected to Requestly desktop app</div>
      <div className="connected-description">
        All traffic from this browser profile is being intercepted by the desktop app. The browser extension won’t work
        until it is disconnected from the desktop app.
      </div>
      <Button danger type="primary" onClick={handleDisconnectFromDesktopApp}>
        Disconnect desktop app
      </Button>
    </div>
  );
};
