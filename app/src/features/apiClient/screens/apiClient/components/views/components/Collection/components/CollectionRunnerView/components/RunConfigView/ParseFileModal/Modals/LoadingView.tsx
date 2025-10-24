import React from "react";

export const LoadingView: React.FC = () => {
  return (
    <>
      <div className="preview-modal-header-container">
        <div className="preview-modal-title">Processing File</div>
      </div>

      <div className="loading-state-container">
        <div className="loading-spinner">
          <div className="spinner-placeholder">
            <svg
              className="spinner-icon"
              width="48"
              height="48"
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="24"
                cy="24"
                r="20"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray="80 40"
                opacity="0.25"
              />
              <circle
                cx="24"
                cy="24"
                r="20"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray="80 40"
                strokeDashoffset="0"
                className="spinner-circle"
              />
            </svg>
          </div>
        </div>
        <div className="loading-message">
          <div className="loading-title">Parsing your file...</div>
          <div className="loading-description detail-label">
            Please wait while we process and validate your data file.
          </div>
        </div>
      </div>
    </>
  );
};
