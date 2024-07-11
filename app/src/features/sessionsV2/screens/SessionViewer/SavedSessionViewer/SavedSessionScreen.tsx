import React from "react";
import "./savedSessionViewer.scss";
import { SessionsHeader } from "./components/SessionsHeader/SessionsHeader";

export const SavedSessionViewer: React.FC = () => {
  return (
    <div className="saved-session-viewer-container">
      <SessionsHeader />
    </div>
  );
};
