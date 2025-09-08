import React from "react";
import { FiAlertOctagon } from "@react-icons/all-files/fi/FiAlertOctagon";
import "./viewOnlyModeBanner.scss";

interface Props {}

export const ViewOnlyModeBanner: React.FC<Props> = () => {
  // TODO: get admin email

  return (
    <div className="view-only-mode-banner no-drag">
      <div className="icon">
        <FiAlertOctagon />
      </div>
      <div className="content">
        <span className="highlight">View-only mode:</span> You can test rules and APIs, but creating or modifying them
        is restricted. Contact your workspace admin to update your role.
      </div>
    </div>
  );
};
