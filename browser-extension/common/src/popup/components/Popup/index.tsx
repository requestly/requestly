import React, { useCallback, useEffect, useState } from "react";
import PopupTabs from "../PopupTabs";
import { EXTENSION_MESSAGES } from "../../../constants";
import PopupHeader from "./PopupHeader";
import PopupFooter from "./PopupFooter";
import { HttpsRuleOptions } from "../HttpsRuleOptions";
import { EVENT, sendEvent } from "../../events";
import "./popup.css";

const Popup: React.FC = () => {
  const [ifNoRulesPresent, setIfNoRulesPresent] = useState<boolean>(true);
  const [isExtensionEnabled, setIsExtensionEnabled] = useState<boolean>(false);

  useEffect(() => {
    chrome.runtime.sendMessage({ action: EXTENSION_MESSAGES.CHECK_IF_NO_RULES_PRESENT }, (noRulesPresent) => {
      setIfNoRulesPresent(noRulesPresent);
      sendEvent(EVENT.POPUP_OPENED, {
        onboarding_screen_viewed: noRulesPresent,
      });
    });

    chrome.runtime.sendMessage({ action: EXTENSION_MESSAGES.CHECK_IF_EXTENSION_ENABLED }, setIsExtensionEnabled);
  }, []);

  const handleToggleExtensionStatus = useCallback(() => {
    sendEvent(EVENT.EXTENSION_STATUS_TOGGLED, {
      isEnabled: !isExtensionEnabled,
    });
    chrome.runtime.sendMessage({ action: EXTENSION_MESSAGES.TOGGLE_EXTENSION_STATUS }, setIsExtensionEnabled);
  }, []);

  return (
    <>
      <div className="popup">
        <PopupHeader
          isExtensionEnabled={isExtensionEnabled}
          handleToggleExtensionStatus={handleToggleExtensionStatus}
        />

        <div className="popup-content">
          {/* remove negation */}
          {!ifNoRulesPresent ? (
            <>
              <HttpsRuleOptions />
            </>
          ) : (
            <PopupTabs />
          )}
        </div>
        <PopupFooter />
      </div>
    </>
  );
};

export default Popup;
