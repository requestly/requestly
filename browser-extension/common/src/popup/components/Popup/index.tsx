import React, { useCallback, useEffect, useState } from "react";
import PopupTabs from "../PopupTabs";
import { EXTENSION_MESSAGES } from "../../../constants";
import PopupHeader from "./PopupHeader";
import { HttpsRuleOptions } from "../HttpsRuleOptions";
import { EVENT, sendEvent } from "../../events";
import SessionRecordingView from "../SessionRecording/SessionRecordingView";
import { getExtensionVersion } from "../../utils";
import "./popup.css";
import { BlockedExtensionView } from "../BlockedExtensionView/BlockedExtensionView";
import DesktopAppProxy from "../DesktopAppProxy";

const Popup: React.FC = () => {
  const [ifNoRulesPresent, setIfNoRulesPresent] = useState<boolean>(true);
  const [isExtensionEnabled, setIsExtensionEnabled] = useState<boolean>(true);
  const [isBlockedOnTab, setIsBlockedOnTab] = useState<boolean>(false);
  const [currentTab, setCurrentTab] = useState<chrome.tabs.Tab>(null);
  const [checkingProxyStatus, setCheckingProxyStatus] = useState<boolean>(true);
  const [isProxyApplied, setIsProxyApplied] = useState<boolean>(false);
  const [isProxyRunning, setIsProxyRunning] = useState<boolean>(false);

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, ([activeTab]) => {
      setCurrentTab(activeTab);
    });
  }, []);

  useEffect(() => {
    chrome.runtime.sendMessage({ action: EXTENSION_MESSAGES.CHECK_IF_NO_RULES_PRESENT }, (noRulesPresent) => {
      setIfNoRulesPresent(noRulesPresent);
      sendEvent(EVENT.POPUP_OPENED, {
        onboarding_screen_viewed: noRulesPresent,
      });
    });

    chrome.runtime.sendMessage({ action: EXTENSION_MESSAGES.CHECK_IF_EXTENSION_ENABLED }, setIsExtensionEnabled);
  }, []);

  useEffect(() => {
    chrome.runtime
      .sendMessage({
        action: EXTENSION_MESSAGES.IS_EXTENSION_BLOCKED_ON_TAB,
        tabUrl: currentTab?.url,
      })
      ?.then(setIsBlockedOnTab);
  }, [currentTab]);

  const handleToggleExtensionStatus = useCallback(() => {
    chrome.runtime.sendMessage({ action: EXTENSION_MESSAGES.TOGGLE_EXTENSION_STATUS }, (updatedStatus) => {
      setIsExtensionEnabled(updatedStatus);
      sendEvent(EVENT.EXTENSION_STATUS_TOGGLED, {
        isEnabled: updatedStatus,
      });
    });
  }, []);

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
    fetchProxyEnabledStatus();
  }, []);

  const handleToggleProxyStatus = () => {
    // TODO: @rohan add/remove proxy code here
    setIsProxyApplied(!isProxyApplied);
  };

  const fetchProxyEnabledStatus = () => {
    // TODO: @rohan fetch the initial status of proxy. COnnected to chrome or not
  };

  return (
    <>
      <div className="popup">
        <PopupHeader
          isExtensionEnabled={isExtensionEnabled}
          handleToggleExtensionStatus={handleToggleExtensionStatus}
        />
        <div className="popup-body">
          {isBlockedOnTab ? (
            <BlockedExtensionView />
          ) : (
            <>
              {!isExtensionEnabled && <div className="extension-paused-overlay"></div>}
              <div className="popup-content">
                {ifNoRulesPresent ? <HttpsRuleOptions /> : <PopupTabs />}
                <SessionRecordingView />
                <DesktopAppProxy
                  handleToggleProxyStatus={handleToggleProxyStatus}
                  checkingProxyStatus={checkingProxyStatus}
                  isProxyApplied={isProxyApplied}
                  isProxyRunning={isProxyRunning}
                />
              </div>
            </>
          )}
        </div>
        <div className="popup-footer">
          <div className="extension-version">v{getExtensionVersion()}</div>
        </div>
      </div>
    </>
  );
};

export default Popup;
