import React, { useEffect, useState } from "react";
import { RQButton } from "lib/design-system-v2/components";
import { localStorage } from "utils/localStorage";
import STORAGE from "config/constants/sub/storage";
import MultiSelectNudgeImg from "assets/img/screenshots/MultiSelectNudgeImg.png";
import "./MultiSelectNudge.scss";

const NUDGE_STORAGE_KEY = STORAGE.LOCAL_STORAGE.CMD_CLICK_MULTI_SELECT_NUDGE_SHOWN;

export const MultiSelectNudge: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasSeenNudge = localStorage.getItem(NUDGE_STORAGE_KEY);

    if (!hasSeenNudge) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 800);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem(NUDGE_STORAGE_KEY, true);
    localStorage.setItem(`${NUDGE_STORAGE_KEY}_timestamp`, new Date().toISOString());
  };

  if (!isVisible) return null;

  const isMac = navigator.platform.toLowerCase().indexOf("mac") >= 0;
  const modifierKey = isMac ? "⌘" : "Ctrl";

  return (
    <div className="cmd-click-nudge">
      <div className="cmd-click-nudge-card">
        <button className="cmd-click-nudge-close" onClick={handleDismiss} aria-label="Close" />

        <div className="cmd-click-nudge-image-wrapper">
          <div className="cmd-click-nudge-image-container">
            <img src={MultiSelectNudgeImg} alt="Multi-select demo" className="cmd-click-nudge-image" />
          </div>
        </div>

        <div className="cmd-click-nudge-content">
          <div className="cmd-click-nudge-header">
            <span className="cmd-click-nudge-icon">✨</span>
            <h4 className="cmd-click-nudge-title">Select multiple requests faster</h4>
          </div>

          <p className="cmd-click-nudge-description">
            Hold <kbd className="cmd-key">{modifierKey}</kbd> and click to select multiple collections or requests for
            batch actions.
          </p>

          <RQButton type="primary" size="small" onClick={handleDismiss} className="cmd-click-nudge-button">
            Got it
          </RQButton>
        </div>
      </div>
    </div>
  );
};
