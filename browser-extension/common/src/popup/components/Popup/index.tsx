import React, { useCallback, useEffect, useMemo, useState } from "react";
import PopupTabs from "../PopupTabs";
import { EXTENSION_MESSAGES } from "../../../constants";
import OnboardingScreen from "../OnboardingScreen";
import PopupHeader from "./PopupHeader";
import PopupFooter from "./PopupFooter";
import { CaretUpOutlined } from "@ant-design/icons";
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

  const productHuntLaunchBanner = useMemo(() => {
    const currentDate = new Date();

    // PDT timezone is 12.5 hours behind IST
    const startDate = new Date("2023-08-16T12:30:00"); // year-month-day T hour:minute:second
    const endDate = new Date("2023-08-19T12:30:00");
    const isBannerVisible = startDate <= currentDate && currentDate <= endDate;

    return isBannerVisible ? (
      <div className="ph-launch-banner">
        <img width="66" height="54" className="ph-kitty-logo" src="/resources/images/ph_kitty.png" />

        <div style={{ marginLeft: "-3px" }}>
          <div style={{ fontWeight: "600" }}>
            Requestly is Now Live on <span style={{ color: "#ff6005" }}>Product Hunt!</span>
          </div>
          <div style={{ color: "rgb(255, 255, 255, 0.8)" }}>
            Show your support by upvoting us on Product Hunt today!
          </div>
        </div>

        <div
          className="support-requestly-btn"
          onClick={() => {
            window.open("https://www.producthunt.com/posts/requestly-session-replays", "_blank");
            sendEvent(EVENT.PRODUCT_HUNT_BANNER_CLICKED);
          }}
        >
          <CaretUpOutlined /> <span className="support-text">Support Requestly</span>
        </div>
      </div>
    ) : null;
  }, []);

  return (
    <>
      {productHuntLaunchBanner}
      <div className="popup">
        <PopupHeader
          isExtensionEnabled={isExtensionEnabled}
          handleToggleExtensionStatus={handleToggleExtensionStatus}
        />
        <div className="popup-content">{ifNoRulesPresent ? <OnboardingScreen /> : <PopupTabs />}</div>
        <PopupFooter
          isExtensionEnabled={isExtensionEnabled}
          handleToggleExtensionStatus={handleToggleExtensionStatus}
        />
      </div>
    </>
  );
};

export default Popup;
