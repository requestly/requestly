import React from "react";
import { MdOutlineWarningAmber } from "@react-icons/all-files/md/MdOutlineWarningAmber";
import "./historyNotSavedBanner.scss";

export const HistoryNotSavedBanner: React.FC = () => {
  return (
    <div className="history-not-saved-banner">
      <MdOutlineWarningAmber />
      <div className="message">
        History not saved for this run — Results will disappear when you refresh or close the tab
      </div>
    </div>
  );
};
