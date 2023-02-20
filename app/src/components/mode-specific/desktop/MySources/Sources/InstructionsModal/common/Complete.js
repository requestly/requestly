import { Button } from "antd";
import React from "react";
import { useNavigate } from "react-router-dom";
import { redirectToRules } from "utils/RedirectionUtils";

const CompleteStep = ({ appId }) => {
  const navigate = useNavigate();

  const navigateToRules = () => {
    redirectToRules(navigate);
  };

  const getTroubleshootLink = (appId) => {
    switch (appId) {
      case "system-wide":
        return "https://docs.requestly.io/desktop-app/troubleshooting/osx-troubleshooting";
      case "fresh-firefox":
        return "https://docs.requestly.io/desktop-app/troubleshooting/osx-troubleshooting";
      default:
        return "https://docs.requestly.io/";
    }
  };

  const handleTroubleshoot = () => {
    const link = getTroubleshootLink(appId);
    window.RQ.DESKTOP.SERVICES.IPC.invokeEventInBG("open-external-link", {
      link: link,
    });
  };

  return (
    <div>
      <Button shape="round" onClick={navigateToRules}>
        Create Rule
      </Button>
      &nbsp;
      <Button shape="round" onClick={handleTroubleshoot}>
        Troubleshoot
      </Button>
    </div>
  );
};

export default CompleteStep;
