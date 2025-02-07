import { RQButton } from "lib/design-system/components";
import React from "react";

const getTroubleshootLink = (appId) => {
  switch (appId) {
    case "ios":
      return "https://docs.requestly.com/desktop-app/setup/ios/ios-devices";
    case "android":
      return "https://docs.requestly.com/desktop-app/setup/android/android-devices#4-if-required-ssl-pinning-ignore";
    case "system-wide":
      return "https://docs.requestly.com/desktop-app/others/troubleshooting/system-wide-proxy-not-working-macos";
    case "existing-terminal":
      return "https://docs.requestly.com/desktop-app/setup/terminal";
    case "manual-setup":
      return "https://docs.requestly.com/desktop-app/setup/terminal";
    default:
      return "https://docs.requestly.com/";
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
