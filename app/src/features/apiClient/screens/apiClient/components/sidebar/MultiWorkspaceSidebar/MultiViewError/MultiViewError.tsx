import React from "react";
import "./multiViewError.scss";

export const MultiViewError: React.FC = () => {
  return (
    <div className="error-in-side-panel-container">
      <div className="error-in-side-panel-icon">
        <img src="/assets/media/apiClient/request-error.svg" alt="Error screen" />
      </div>
      <div className="error-in-side-panel-text">Unknown error occurred while adding workspace to the view.</div>
      <div className="error-in-side-panel-description">
        Try restarting the app to fix this issue, or contact{" "}
        <span className="description-link">
          <a href="mailto:contact@requestly.io">support</a>
        </span>
      </div>
    </div>
  );
};
