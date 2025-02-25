import React from "react";
import { FiAlertOctagon } from "@react-icons/all-files/fi/FiAlertOctagon";
import "./readOnlyModeAlert.scss";

export const ReadOnlyModeAlert: React.FC = () => {
  // TODO: get admin email

  return (
    <div className="read-only-mode-alert">
      <div className="icon">
        <FiAlertOctagon />
      </div>
      <div className="content">
        <span className="highlight">View-only mode:</span> As a viewer, you can test rules but cannot modify them.
        <br /> Contact your workspace admin to request an update to your role.
      </div>
    </div>
  );
};
