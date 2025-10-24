import React, { useCallback, useEffect, useState } from "react";
import PopupTabs from "../PopupTabs";
import { EXTENSION_MESSAGES } from "../../../constants";
import PopupHeader from "./PopupHeader";
import { HttpsRuleOptions } from "../HttpsRuleOptions";
import { EVENT, sendEvent } from "../../events";
import SessionRecordingView from "../SessionRecording/SessionRecordingView";
import { getExtensionVersion } from "../../utils";
import { BlockedExtensionView } from "../BlockedExtensionView/BlockedExtensionView";
import DesktopAppProxy from "../DesktopAppProxy/DesktopAppProxy";
import { ConnectedToDesktopView } from "../DesktopAppProxy/components/ConnectedToDesktopView/ConnectedToDesktopView";
import "./popup.css";
import { message } from "antd";
import { ApiClientContainer } from "../ApiClientContainer/ApiClientContainer";

const Popup: React.FC = () => {
  const [ifNoRulesPresent, setIfNoRulesPresent] = useState<boolean>(true);
  const [isExtensionEnabled, setIsExtensionEnabled] = useState<boolean>(true);
  const [isBlockedOnTab, setIsBlockedOnTab] = useState<boolean>(false);
  const [currentTab, setCurrentTab] = useState<chrome.tabs.Tab>(null);
  const [isProxyApplied, setIsProxyApplied] = useState<boolean>(false);
  const [isDesktopAppOpen, setIsDesktopAppOpen] = useState(false);
  const [isSessionReplayEnabled, setIsSessionReplayEnabled] = useState<boolean>(false);

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

  useEffect(() => {
    chrome.runtime
      .sendMessage({
        action: EXTENSION_MESSAGES.IS_SESSION_REPLAY_ENABLED,
      })
      ?.then(setIsSessionReplayEnabled);
  }, []);

  const checkIfDesktopAppOpen = useCallback(() => {
    chrome.runtime.sendMessage({ action: EXTENSION_MESSAGES.CHECK_IF_DESKTOP_APP_OPEN }).then(setIsDesktopAppOpen);
  }, []);

  useEffect(() => {
    checkIfDesktopAppOpen();
  }, [checkIfDesktopAppOpen]);

  const handleToggleExtensionStatus = useCallback((newStatus: boolean) => {
    console.log("[Popup] handleToggleExtensionStatus", {
      newStatus,
    });
    chrome.runtime.sendMessage(
      { action: EXTENSION_MESSAGES.TOGGLE_EXTENSION_STATUS, newStatus },
      ({ success, updatedStatus }) => {
        console.log("[Popup] handleToggleExtensionStatus callback", {
          success,
          updatedStatus,
        });
        if (!success) {
          message.error("Cannot update extension status. Please contact support.", 0.75);
          return;
        }
        setIsExtensionEnabled(updatedStatus);
        sendEvent(EVENT.EXTENSION_STATUS_TOGGLED, {
          isEnabled: updatedStatus,
        });
      }
    );
  }, []);

  return (
    <>
      <div className="popup">
        {isProxyApplied ? (
          <ConnectedToDesktopView onDisconnectClick={() => setIsProxyApplied(false)} />
        ) : (
          <>
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
                    {ifNoRulesPresent || isProxyApplied || isDesktopAppOpen ? (
                      <HttpsRuleOptions />
                    ) : (
                      <PopupTabs isSessionReplayEnabled={isSessionReplayEnabled} />
                    )}
                    <ApiClientContainer />
                    {isSessionReplayEnabled && <SessionRecordingView />}
                    <DesktopAppProxy
                      isProxyApplied={isProxyApplied}
                      onProxyStatusChange={setIsProxyApplied}
                      isDesktopAppOpen={isDesktopAppOpen}
                    />
                  </div>
                </>
              )}
            </div>
          </>
        )}

        <div className="popup-footer">
          <div className="extension-version">v{getExtensionVersion()}</div>
        </div>
      </div>
    </>
  );
};

export default Popup;
