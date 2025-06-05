import React from "react";
import BlockedExtension from "../../../../resources/icons/blockedExtension.svg";
import "./blockedExtensionView.scss";
import { Button } from "antd";
import config from "../../../config";

export const BlockedExtensionView = () => {
  return (
    <div className="blocked-extension-view-container">
      <BlockedExtension className="blocked-extension-view-icon" />
      <div className="blocked-extension-view-title">Requestly is blocked on this page.</div>
      <div className="blocked-extension-view-description">
        This page is in the blocklist. Please remove it from the app blocklist settings for Requestly to work.
      </div>
      <Button
        type="primary"
        onClick={() => {
          chrome.tabs.create({
            url: `${config.WEB_URL}/settings/global-settings?source=popup`,
          });
        }}
      >
        Unblock
      </Button>
    </div>
  );
};
