import { useFeatureValue } from "@growthbook/growthbook-react";
import { RQButton } from "lib/design-system/components";
import { redirectToUrl } from "utils/RedirectionUtils";
import "./index.scss";

export const PricingModalFooterBanner = () => {
  const paywallIntensityExp = useFeatureValue("paywall_intensity", null);

  console.log("monetizationExp", paywallIntensityExp);
  return (
    <div className="pricing-modal-footer-banner">
      <div className="pricing-modal-footer-banner-content">
        <span className="pricing-modal-footer-banner-text">Need help finding the right plan for your team?</span>
        <RQButton
          type="default"
          className="pricing-modal-footer-banner-btn"
          onClick={() => redirectToUrl("https://calendly.com/requestly/sagar", true)}
        >
          Contact Us
        </RQButton>
      </div>
      {/* {paywallIntensityExp === "variantA" ? (
        <div className="pricing-modal-footer-banner-content">
          <span className="pricing-modal-footer-banner-text">Request access for a 30 day free trial</span>
          <RQButton
            type="default"
            className="pricing-modal-footer-banner-btn"
            // onClick={() => redirectToUrl("https://calendly.com/requestly/sagar", true)}
          >
            Request now
          </RQButton>
        </div>
      ) : ( */}
      {/* )} */}
    </div>
  );
};
