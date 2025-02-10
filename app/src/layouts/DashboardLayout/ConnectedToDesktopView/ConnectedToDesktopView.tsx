import { Button } from "antd";
import { disconnectFromDesktopApp } from "actions/ExtensionActions";
import "./connectedToDesktopView.scss";

export const ConnectedToDesktopView = () => {
  return (
    <div className="desktop-app-connected-view">
      <img
        src={"/assets/media/Dashboard/connectedToDesktop.svg"}
        alt="connected-to-desktop"
        className="connected-icon"
      />
      <div className="connected-title">Connected to Requestly desktop app</div>
      <div className="connected-description">
        All traffic from this browser profile is being intercepted by the desktop app. The browser extension won’t work
        until it is disconnected from the desktop app.
      </div>
      <Button danger type="primary" onClick={disconnectFromDesktopApp}>
        Disconnect desktop app
      </Button>
    </div>
  );
};
