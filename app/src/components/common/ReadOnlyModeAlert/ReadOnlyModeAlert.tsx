import React from "react";
import { FiAlertOctagon } from "@react-icons/all-files/fi/FiAlertOctagon";
import "./readOnlyModeAlert.scss";

interface Props {
  description: string;
}

export const ReadOnlyModeAlert: React.FC<Props> = ({
  description = "As a viewer, you cannot update or modify anything.",
}) => {
  // TODO: get admin email

  return (
    <div className="read-only-mode-alert">
      <div className="icon">
        <FiAlertOctagon />
      </div>
      <div className="content">
        <span className="highlight">View-only mode:</span> {description}
        <br /> Contact your workspace admin to request an update to your role.
      </div>
    </div>
  );
};
