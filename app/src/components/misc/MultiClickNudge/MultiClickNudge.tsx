import React, { useEffect, useState } from "react";
import { RQButton } from "lib/design-system-v2/components";
import "./MultiSelectNudge.scss";
import MultiClickNudgeImg from "../../../assets/img/screenshots/MultiClickNudgeImg.webp";
const NUDGE_STORAGE_KEY = "cmd_click_multi_select_nudge_shown";

export const MultiSelectNudge: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasSeenNudge = localStorage.getItem(NUDGE_STORAGE_KEY);
    if (!hasSeenNudge) {
      const timer = setTimeout(() => setIsVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(NUDGE_STORAGE_KEY, "true");
    setIsVisible(false);
  };

  const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
  const commandKey = isMac ? "⌘" : "Ctrl";

  if (!isVisible) return null;

  return (
    <div className="cmd-click-nudge">
      <div className="cmd-click-nudge-card">
        <div className="cmd-click-nudge-image-wrapper">
          <div className="cmd-click-nudge-image-container">
            <img
              src={MultiClickNudgeImg}
              alt="A demonstration of multi-selecting items in a list."
              className="cmd-click-nudge-image"
            />
          </div>
          <div className="cmd-click-nudge-key-hint">Hold “{commandKey}” key</div>
        </div>

        <div className="cmd-click-nudge-content">
          <div className="cmd-click-nudge-header">
            <span className="cmd-click-nudge-icon" role="img" aria-label="sparkles">
              ✨
            </span>
            <h3 className="cmd-click-nudge-title">Select multiple requests faster</h3>
          </div>

          <p className="cmd-click-nudge-description">
            Hold <span className="cmd-key">{commandKey}</span> and click to select multiple collections or requests for
            batch actions.
          </p>

          <RQButton className="cmd-click-nudge-button" onClick={handleDismiss}>
            Got it
          </RQButton>
        </div>
      </div>
    </div>
  );
};
