import React from "react";
import { RQButton } from "lib/design-system/components";
import { useDispatch } from "react-redux";
import { actions } from "store";
import { useNavigate } from "react-router-dom";
import { redirectToRules } from "utils/RedirectionUtils";

const CompleteStep = ({ appId }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const navigateToRules = () => {
    redirectToRules(navigate);
  };

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

  const handleTroubleshoot = () => {
    const link = getTroubleshootLink(appId);
    window.RQ.DESKTOP.SERVICES.IPC.invokeEventInBG("open-external-link", {
      link: link,
    });
  };

  return (
    <div className="mt-8">
      <RQButton
        type="default"
        className="mr-8"
        onClick={() => {
          dispatch(
            actions.toggleActiveModal({
              modalName: "connectedAppsModal",
              newValue: false,
            })
          );
          navigateToRules();
        }}
      >
        Create Rule
      </RQButton>
      <RQButton type="default" onClick={handleTroubleshoot}>
        Troubleshoot
      </RQButton>
    </div>
  );
};

export default CompleteStep;
