import { RQButton } from "lib/design-system-v2/components";
import React from "react";
import "./index.scss";
import { trackDesktopAppPromoClicked } from "modules/analytics/events/common/onboarding";
import { RequestMethod } from "features/apiClient/types";

interface Props {
  method?: RequestMethod;
}

const RequestBodyRedirectScreen: React.FC<Props> = ({ method }) => {
  const methodLabel = method ?? "GET";

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
          <span className="request-body-redirect-screen-title">
            Request body not available for {methodLabel} requests
          </span>
          <p className="request-body-redirect-screen-description">
            The web app doesn't support request bodies for {methodLabel} requests.
            <br /> To send a request body, use the desktop app.
          </p>
        </div>

        <RQButton
          onClick={() => trackDesktopAppPromoClicked("request_body", "web_app")}
          href="https://requestly.com/downloads/desktop/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Download desktop app
        </RQButton>
      </div>
    </div>
  );
};

export default RequestBodyRedirectScreen;
