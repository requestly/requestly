import React from "react";
import "./grrWarningMessage.scss";

export const GrrWarningMessage: React.FC = () => {
  return (
    <div className="grr-warning-message-container">
      <div className="grr-warning-message-icon">
        <img width={56} height={56} src={"/assets/media/grr/globe-warning.svg"} alt="GRR warning" />
      </div>
      <div className="grr-warning-content">
        <div className="grr-warning-message-title">
          Requestly is not compliant with Data Residency (GRR) regulations
        </div>
        <div className="grr-warning-message-description">
          Requestly is now a part of BrowserStack and your organization in BrowserStack has enabled Data Residency,
          which mandates you to use compliant products. Write us at
          <a
            target="_blank"
            rel="noreferrer"
            href="mailto:contact@requestly.com"
            className="grr-warning-message-contact-mail"
          >
            contact@requestly.com
          </a>
          or contact your BrowserStack Customer Success Manager to discuss continued usage of this product
        </div>
      </div>
    </div>
  );
};
