import React, { useCallback, useEffect, useState } from "react";
import { EXTENSION_MESSAGES } from "../../../constants";
import PopupHeader from "./PopupHeader";
import { EVENT, sendEvent } from "../../events";
import SessionRecordingView from "../SessionRecording/SessionRecordingView";
import "./popup.css";

const Popup: React.FC = () => {
  const [isExtensionEnabled, setIsExtensionEnabled] = useState<boolean>(true);

  useEffect(() => {
    chrome.runtime.sendMessage({ action: EXTENSION_MESSAGES.CHECK_IF_EXTENSION_ENABLED }, setIsExtensionEnabled);
  }, []);

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
          {!isExtensionEnabled && <div className="extension-paused-overlay"></div>}
          <div className="popup-content">
            <SessionRecordingView />
          </div>
        </div>
      </div>
    </>
  );
};

export default Popup;
