import React from "react";
import { RQButton } from "lib/design-system-v2/components";
import { MdOutlineCheckCircle } from "@react-icons/all-files/md/MdOutlineCheckCircle";
import "./authSuccessCard.scss";

export const AuthSuccessCard: React.FC = () => {
  const handleCloseWindow = () => {
    window.close();
  };

  return (
    <div className="desktop-app-auth-success-container">
      <MdOutlineCheckCircle className="desktop-app-auth-success-icon" />

      <div className="desktop-app-auth-success-description">
        You are now logged into the Requestly desktop app. You can safely close this window.
      </div>
      <div className="desktop-app-auth-success-actions">
        <RQButton block size="large" onClick={handleCloseWindow}>
          Close this window
        </RQButton>
      </div>
    </div>
  );
};
