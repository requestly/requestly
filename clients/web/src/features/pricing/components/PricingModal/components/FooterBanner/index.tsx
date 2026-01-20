import { trackContactUsClicked } from "modules/analytics/events/misc/monetizationExperiment";
import "./index.scss";
import LINKS from "config/constants/sub/links";

export const PricingModalFooterBanner = () => {
  return (
    <div className="pricing-modal-footer-banner">
      <div className="pricing-modal-footer-banner-content">
        <span className="pricing-modal-footer-banner-text">Need help finding the right plan for your team?</span>
        <a
          target="_blank"
          rel="noreferrer"
          href={LINKS.BOOK_A_DEMO}
          className="pricing-modal-footer-banner-link"
          onClick={() => {
            trackContactUsClicked("pricing_modal");
          }}
        >
          Contact us
        </a>
      </div>
    </div>
  );
};
