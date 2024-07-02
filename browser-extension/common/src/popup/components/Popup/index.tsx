import React, { useCallback, useEffect, useState } from "react";
import PopupTabs from "../PopupTabs";
import { EXTENSION_MESSAGES } from "../../../constants";
import PopupHeader from "./PopupHeader";
import { HttpsRuleOptions } from "../HttpsRuleOptions";
import { EVENT, sendEvent } from "../../events";
import SessionRecordingView from "../SessionRecording/SessionRecordingView";
import "./popup.css";

const Popup: React.FC = () => {
  const [ifNoRulesPresent, setIfNoRulesPresent] = useState<boolean>(true);
  const [isExtensionEnabled, setIsExtensionEnabled] = useState<boolean>(true);
  const [isBlockedOnTab, setIsBlockedOnTab] = useState<boolean>(false);
  const [currentTabUrl, setCurrentTabUrl] = useState<string>("");

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, ([activeTab]) => {
      setCurrentTabUrl(activeTab.url);
    });
  });

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
        tabUrl: currentTabUrl,
      })
      .then(setIsBlockedOnTab);
  }, [currentTabUrl]);

  const handleToggleExtensionStatus = useCallback(() => {
    chrome.runtime.sendMessage({ action: EXTENSION_MESSAGES.TOGGLE_EXTENSION_STATUS }, (updatedStatus) => {
      setIsExtensionEnabled(updatedStatus);
      sendEvent(EVENT.EXTENSION_STATUS_TOGGLED, {
        isEnabled: updatedStatus,
      });
    });
  }, []);

  return (
    <>
      <div className="popup">
        <PopupHeader
          isExtensionEnabled={isExtensionEnabled}
          handleToggleExtensionStatus={handleToggleExtensionStatus}
        />
        <div className="popup-body">
          {isBlockedOnTab ? (
            <>
              <div>COOOOL</div>
            </>
          ) : (
            <>
              {!isExtensionEnabled && <div className="extension-paused-overlay"></div>}
              <div className="popup-content">
                {ifNoRulesPresent ? <HttpsRuleOptions /> : <PopupTabs />}
                <SessionRecordingView />
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Popup;
