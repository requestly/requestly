import React, { useState } from "react";
import { Banner } from "../banner.types";
import { capitalize } from "lodash";
import { trackAppBannerCtaClicked } from "../analytics";
import { RQButton } from "lib/design-system/components";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { redirectToUrl } from "utils/RedirectionUtils";

interface Props {
  banner: Banner;
  onClose: (e: React.MouseEvent) => void;
}

export const ChromeReviewBanner: React.FC<Props> = ({ banner, onClose }) => {
  const [hasReviewed, setHasReviewed] = useState(
    // HELP! NEED TO DECIDE THE VARIABLE FOR NOW USING ["redirect_to_chrome_store_reviews"]
    () => localStorage.getItem("isRedirectedTOChromeStoreReview") === "true"
  );

  const handleReviewClick = () => {
    localStorage.setItem("isRedirectedTOChromeStoreReview", "true");
    setHasReviewed(true);
    // HELP! NEED TO DECIDE THE ACTION NAME FOR NOW USING ["redirect_to_chrome_store_reviews"]
    trackAppBannerCtaClicked(banner?.id, "redirect_to_chrome_store_reviews");
    redirectToUrl("https://rqst.ly/chrome-review", true);
  };

  const bannerText = hasReviewed
    ? "Thanks! Upload a screenshot of your review via the chatbot (bottom right) to claim your free month."
    : "Enjoying Requestly? Leave a Chrome review and get 1 month Professional Plan free!";

  return (
    <div className={`app-banner`} style={{ backgroundColor: banner?.backgroundColor || "var(--blue-blue-600)" }}>
      {banner?.short_text && (
        <span className="app-banner-badge" style={{ backgroundColor: banner?.badgeColor || "var(--blue-blue-600)" }}>
          {banner.short_text}
        </span>
      )}

      <div className="app-banner-text">
        <ReactMarkdown rehypePlugins={[rehypeRaw]}>{bannerText}</ReactMarkdown>
      </div>

      {!hasReviewed && (
        <div className="app-banner-action-buttons">
          <RQButton type="primary" onClick={handleReviewClick}>
            {capitalize("Review Now")}
          </RQButton>
        </div>
      )}

      {banner?.isDismissable !== false && (
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
  );
};
