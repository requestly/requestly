import { RQButton } from "lib/design-system-v2/components";
import React from "react";
import "./index.scss";
import { MdOutlineInfo } from "@react-icons/all-files/md/MdOutlineInfo";
import { trackDesktopAppPromoClicked } from "modules/analytics/events/common/onboarding";

const MultipartFormRedirectScreen: React.FC = () => {
  return (
    <div className="multipart-form-redirect-screen-container">
      <div className="multipart-form-redirect-screen-empty-state">
        <img
          src="/assets/media/apiClient/download-desktop.svg"
          alt="Not supported in web version"
          style={{
            width: "48px",
            height: "48px",
          }}
        />
        <div className="multipart-form-redirect-screen-content">
          <div className="multipart-form-redirect-info-container">
            <MdOutlineInfo
              style={{
                marginTop: "2px",
                width: "16px",
                height: "16px",
              }}
            />
            <text
              style={{
                overflow: "hidden",
                textAlign: "center",
                textOverflow: "ellipsis",
                fontSize: "14px",
                fontWeight: 500,
                lineHeight: "20px",
              }}
            >
              Not supported in web version
            </text>
          </div>

          {/* FIXME: Replace inline styles */}
          <p
            style={{
              color: "var(--requestly-color-text-subtle)",
              textAlign: "center",
              fontSize: "11px",
              fontStyle: "normal",
              fontWeight: 400,
              lineHeight: "17px",
            }}
          >
            Multipart/form-data requests aren't available in the browser yet. Please download the Requestly desktop app
            to use this feature.
          </p>
        </div>

        <RQButton
          onClick={() => trackDesktopAppPromoClicked("multipart_forms_data", "web_app")}
          href="https://requestly.com/downloads/desktop/"
          target="_blank"
        >
          Download Requestly
        </RQButton>
      </div>
    </div>
  );
};

export default MultipartFormRedirectScreen;
