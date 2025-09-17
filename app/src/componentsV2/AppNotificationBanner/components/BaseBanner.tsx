import React from "react";
import { RQButton } from "lib/design-system/components";
import ReactMarkdown from "react-markdown";
import { Banner, BANNER_TYPE } from "../banner.types";
import rehypeRaw from "rehype-raw";
import { capitalize } from "lodash";
import { trackAppBannerCtaClicked } from "../analytics";
import { RequestBillingTeamAccessModal } from "features/settings";
import { ButtonType } from "antd/lib/button";

interface Props {
  banner: Banner;
  onClose: (e: React.MouseEvent) => void;
  text: string;
  actionsConfig: { label: string; type: ButtonType; onClick: () => void }[];
  isRequestAccessModalOpen?: boolean;
  setIsRequestAccessModalOpen?: (value: boolean) => void;
}

export const BaseBanner: React.FC<Props> = ({
  banner,
  onClose,
  text,
  actionsConfig,
  isRequestAccessModalOpen = false,
  setIsRequestAccessModalOpen,
}) => {
  const getBannerClassName = (bannerType?: string) => {
    switch (bannerType) {
      case BANNER_TYPE.WARNING:
        return "app-banner__warning";
      default:
        return "";
    }
  };
  return (
    <>
      <div
        className={`app-banner ${getBannerClassName(banner.type)}`}
        style={{ backgroundColor: banner.backgroundColor || "var(--requestly-color-primary-600)" }}
      >
        {banner.short_text && (
          <span
            className="app-banner-badge"
            style={{ backgroundColor: banner.badgeColor || "var(--requestly-color-primary-600)" }}
          >
            {banner.short_text}
          </span>
        )}

        <div className="app-banner-text">
          <ReactMarkdown rehypePlugins={[rehypeRaw]}>{text}</ReactMarkdown>
        </div>

        {actionsConfig && actionsConfig.length > 0 && (
          <div className="app-banner-action-buttons">
            {actionsConfig.map((action, index) => (
              <RQButton
                key={index}
                type={action.type as ButtonType}
                onClick={() => {
                  action.onClick();
                  trackAppBannerCtaClicked(banner.id, action.label);
                }}
              >
                {capitalize(action.label)}
              </RQButton>
            ))}
          </div>
        )}

        {banner.isDismissable !== false && (
          <div className="close-button-container">
            <RQButton
              iconOnly
              className="close-btn"
              onClick={onClose}
              icon={
                <svg width="11.67" height="11.67" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    fill="#ffffff"
                    d="M1.08736 1.08492C1.31516 0.857111 1.68451 0.857111 1.91232 1.08492L4.99984 4.17244L8.08736 1.08492C8.31517 0.857111 8.68451 0.857111 8.91232 1.08492C9.14012 1.31272 9.14012 1.68207 8.91232 1.90988L5.8248 4.9974L8.91232 8.08492C9.14012 8.31272 9.14012 8.68207 8.91232 8.90988C8.68451 9.13768 8.31517 9.13768 8.08736 8.90988L4.99984 5.82235L1.91232 8.90988C1.68451 9.13768 1.31516 9.13768 1.08736 8.90988C0.859552 8.68207 0.859552 8.31272 1.08736 8.08492L4.17488 4.9974L1.08736 1.90988C0.859552 1.68207 0.859552 1.31272 1.08736 1.08492Z"
                  />
                </svg>
              }
            />
          </div>
        )}
      </div>

      <RequestBillingTeamAccessModal
        isOpen={isRequestAccessModalOpen}
        onClose={() => setIsRequestAccessModalOpen(false)}
      />
    </>
  );
};

export default BaseBanner;
