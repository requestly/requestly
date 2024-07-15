import React from "react";
import "./sessionInfo.scss";

export const SessionInfo: React.FC = () => {
  return (
    <div className="sessions-info-container">
      <div className="sessions-info-item">
        <span className="sessions-info-item-label">Session ID</span>
        <span className="sessions-info-item-value">123456789</span>
      </div>
      <div className="sessions-info-item">
        <span className="sessions-info-item-label">Session URL</span>
        <span className="sessions-info-item-value">https://www.example.com</span>
      </div>
      <div className="sessions-info-item">
        <span className="sessions-info-item-label">Session Duration</span>
        <span className="sessions-info-item-value">1 hour</span>
      </div>
      <div className="sessions-info-item">
        <span className="sessions-info-item-label">Session Start Time</span>
        <span className="sessions-info-item-value">12:00 PM</span>
      </div>
      <div className="sessions-info-item">
        <span className="sessions-info-item-label">Session End Time</span>
        <span className="sessions-info-item-value">1:00 PM</span>
      </div>
    </div>
  );
};
