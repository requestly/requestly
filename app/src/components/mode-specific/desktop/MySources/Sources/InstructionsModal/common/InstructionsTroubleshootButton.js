import { RQButton } from "lib/design-system/components";
import React from "react";

const getTroubleshootLink = (appId) => {
  switch (appId) {
    case "ios":
      return "https://docs.requestly.io/desktop-app/mac/getting-started/setup/ios";
    case "android":
      return "https://docs.requestly.io/desktop-app/mac/getting-started/setup/android";
    case "system-wide":
      return "https://docs.requestly.io/desktop-app/troubleshooting/osx-troubleshooting";
    case "fresh-firefox":
      return "https://docs.requestly.io/desktop-app/troubleshooting/osx-troubleshooting";
    case "existing-terminal":
      return "https://docs.requestly.io/desktop-app/mac/getting-started/setup/terminal";
    case "manual-setup":
      return "https://docs.requestly.io/desktop-app/mac/category/troubleshooting";
    default:
      return "https://docs.requestly.io/";
  }
};

const TroubleshootLink = ({ appId }) => {
  const handleTroubleshoot = () => {
    const link = getTroubleshootLink(appId);
    window.RQ.DESKTOP.SERVICES.IPC.invokeEventInBG("open-external-link", {
      link: link,
    });
  };

  return (
    <RQButton type="link" className="troubleshoot-btn" onClick={handleTroubleshoot}>
      Troubleshoot
    </RQButton>
  );
};

export default TroubleshootLink;
