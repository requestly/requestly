import React from "react";
import { RQButton } from "lib/design-system-v2/components";
import "./authMessageCard.scss";

interface AuthMessageCardProps {
  icon: React.ReactNode;
  message: string;
  showCloseBtn?: boolean;
}

export const AuthMessageCard: React.FC<AuthMessageCardProps> = ({ icon, message, showCloseBtn = true }) => {
  const handleCloseWindow = () => {
    window.close();
  };

  return (
    <div className="desktop-app-auth-message-card-container">
      <span className="desktop-app-auth-message-card-icon">{icon}</span>
      <div className="desktop-app-auth-message-card-description">{message}</div>
      {showCloseBtn ? (
        <div className="desktop-app-auth-message-card-actions">
          <RQButton block size="large" onClick={handleCloseWindow}>
            Close this window
          </RQButton>
        </div>
      ) : null}
    </div>
  );
};
