import { RQButton } from "lib/design-system-v2/components";
import React from "react";
import "./index.scss";
import { trackDesktopAppPromoClicked } from "modules/analytics/events/common/onboarding";

const GetRequestBodyRedirectScreen: React.FC = () => {
  return (
    <div className="get-request-body-redirect-screen-container">
      <div className="get-request-body-redirect-screen-empty-state">
        <img
          src="/assets/media/apiClient/desktop-not-available.svg"
          alt="Not supported in web version"
          style={{
            width: "64px",
            height: "64px",
          }}
        />
        <div className="get-request-body-redirect-screen-content">
          <span className="get-request-body-redirect-screen-title">Body for GET request is not available on web</span>
          <p className="get-request-body-redirect-screen-description">
            Sending a body with a GET request isn't supported in the web application.
            <br /> Use the desktop app to enable this capability.
          </p>
        </div>

        <RQButton
          onClick={() => trackDesktopAppPromoClicked("get_request_body", "web_app")}
          href="https://requestly.com/downloads/desktop/"
          target="_blank"
        >
          Download the desktop app
        </RQButton>
      </div>
    </div>
  );
};

export default GetRequestBodyRedirectScreen;
