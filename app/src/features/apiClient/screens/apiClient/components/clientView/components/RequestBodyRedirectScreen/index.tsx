import { RQButton } from "lib/design-system-v2/components";
import React from "react";
import "./index.scss";
import { trackDesktopAppPromoClicked } from "modules/analytics/events/common/onboarding";

const RequestBodyRedirectScreen: React.FC = () => {
  return (
    <div className="request-body-redirect-screen-container">
      <div className="request-body-redirect-screen-empty-state">
        <img
          src="/assets/media/apiClient/desktop-not-available.svg"
          alt="Not supported in web version"
          style={{
            width: "64px",
            height: "64px",
          }}
        />
        <div className="request-body-redirect-screen-content">
          <span className="request-body-redirect-screen-title">Request body is not available on web</span>
          <p className="request-body-redirect-screen-description">
            Sending a request body with this method isn't supported in the web application.
            <br /> Use the desktop app to enable this capability.
          </p>
        </div>

        <RQButton
          onClick={() => trackDesktopAppPromoClicked("request_body", "web_app")}
          href="https://requestly.com/downloads/desktop/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Download the desktop app
        </RQButton>
      </div>
    </div>
  );
};

export default RequestBodyRedirectScreen;
