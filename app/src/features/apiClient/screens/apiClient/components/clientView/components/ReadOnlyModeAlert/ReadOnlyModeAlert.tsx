import React from "react";
import { MdInfoOutline } from "@react-icons/all-files/md/MdInfoOutline";
import "./readOnlyModeAlert.scss";

interface props {
  description: string;
  action?: React.ReactNode;
}

export const ReadOnlyModeAlert: React.FC<props> = ({ description, action }) => {
  // TODO: consume RQAlert - yet to be created

  return (
    <div className="api-client-read-only-mode-alert">
      <div className="icon">
        <MdInfoOutline />
      </div>
      <div className="description">{description}</div>
      <div className="action-container">{action ? action : null}</div>
    </div>
  );
};
