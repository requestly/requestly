import React, { useCallback, useEffect, useState } from "react";
import PopupTabs from "../PopupTabs";
import { EXTENSION_MESSAGES } from "../../../constants";
import OnboardingScreen from "../OnboardingScreen";
import PopupHeader from "./PopupHeader";
import PopupFooter from "./PopupFooter";
import "./popup.css";
import { EVENT, sendEvent } from "../../events";

const Popup: React.FC = () => {
  const [ifNoRulesPresent, setIfNoRulesPresent] = useState<boolean>(true);
  const [isExtensionEnabled, setIsExtensionEnabled] = useState<boolean>(false);

  useEffect(() => {
    chrome.runtime.sendMessage({ action: EXTENSION_MESSAGES.CHECK_IF_NO_RULES_PRESENT }, setIfNoRulesPresent);

    chrome.runtime.sendMessage({ action: EXTENSION_MESSAGES.CHECK_IF_EXTENSION_ENABLED }, setIsExtensionEnabled);

    sendEvent(EVENT.POPUP_OPENED, {
      onboarding_screen_viewed: ifNoRulesPresent,
    });
  }, []);

  const handleToggleExtensionStatus = useCallback(() => {
    chrome.runtime.sendMessage({ action: EXTENSION_MESSAGES.TOGGLE_EXTENSION_STATUS }, setIsExtensionEnabled);
    sendEvent(EVENT.EXTENSION_STATUS_TOGGLED);
  }, []);

  return (
    <div className="popup">
      <PopupHeader isExtensionEnabled={isExtensionEnabled} handleToggleExtensionStatus={handleToggleExtensionStatus} />
      <div className="popup-content">{ifNoRulesPresent ? <OnboardingScreen /> : <PopupTabs />}</div>
      <PopupFooter isExtensionEnabled={isExtensionEnabled} handleToggleExtensionStatus={handleToggleExtensionStatus} />
    </div>
  );
};

export default Popup;
