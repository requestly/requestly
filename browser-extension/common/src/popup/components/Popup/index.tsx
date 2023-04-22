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

  const [checkingProxyStatus, setCheckingProxyStatus] = useState<boolean>(true);
  const [isProxyEnabled, setIsProxyEnabled] = useState<boolean>(false);
  const [isProxyRunning, setIsProxyRunning] = useState<boolean>(false);

  useEffect(() => {
    setCheckingProxyStatus(true);
    fetch("http://127.0.0.1:8281")
      .then(() => {
        setIsProxyRunning(true);
        console.log("Proxy Running");
        setCheckingProxyStatus(false);
      })
      .catch((err) => {
        console.log("Proxy Not Running");
        setIsProxyRunning(false);
        setCheckingProxyStatus(false);
      });
  }, []);

  useEffect(() => {
    chrome.runtime.sendMessage({ action: EXTENSION_MESSAGES.CHECK_IF_NO_RULES_PRESENT }, setIfNoRulesPresent);

    chrome.runtime.sendMessage({ action: EXTENSION_MESSAGES.CHECK_IF_EXTENSION_ENABLED }, setIsExtensionEnabled);

    sendEvent(EVENT.POPUP_OPENED);
  }, []);

  const handleToggleExtensionStatus = useCallback(() => {
    chrome.runtime.sendMessage({ action: EXTENSION_MESSAGES.TOGGLE_EXTENSION_STATUS }, setIsExtensionEnabled);
  }, []);

  const handleToggleProxyStatus = () => {
    // TODO: @rohan add/remove proxy code here
    setIsProxyEnabled(!isProxyEnabled);
  };

  useEffect(() => {
    fetchProxyEnabledStatus();
  }, []);

  const fetchProxyEnabledStatus = () => {
    // TODO: @rohan fetch the initial status of proxy. COnnected to chrome or not
  };

  return (
    <div className="popup">
      <PopupHeader
        isExtensionEnabled={isExtensionEnabled}
        handleToggleExtensionStatus={handleToggleExtensionStatus}
        checkingProxyStatus={checkingProxyStatus}
        isProxyEnabled={isProxyEnabled}
        isProxyRunning={isProxyRunning}
        handleToggleProxyStatus={handleToggleProxyStatus}
      />
      <div className="popup-content">{ifNoRulesPresent ? <OnboardingScreen /> : <PopupTabs />}</div>
      <PopupFooter
        isExtensionEnabled={isExtensionEnabled}
        handleToggleExtensionStatus={handleToggleExtensionStatus}
        checkingProxyStatus={checkingProxyStatus}
        isProxyEnabled={isProxyEnabled}
        isProxyRunning={isProxyRunning}
      />
    </div>
  );
};

export default Popup;
