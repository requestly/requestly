import { useState } from "react";
import { RQButton } from "lib/design-system/components";
import { ContactUsModal } from "componentsV2/modals/ContactUsModal";
import { SOURCE } from "modules/analytics/events/common/constants";
import React from "react";
import "./enterprisePlanCard.scss";
import { PRICING } from "features/pricing/constants/pricing";

interface Props {
  product?: string;
}

export const EnterprisePlanCard: React.FC<Props> = ({ product = PRICING.PRODUCTS.HTTP_RULES }) => {
  const [isContactUsModalOpen, setIsContactUsModalOpen] = useState(false);
  const features = [
    "Unlimited everything",
    "API access",
    "SSO & SAML",
    "Security & compliance (GDPR, SOC2)",
    "User Access Management",
    "SLAs (Support, Service Uptime, Insurance)",
    "Pay by invoice",
    "Priority Support - Slack Connect, Email, Chat",
  ];

  if (product === PRICING.PRODUCTS.API_CLIENT) {
    return null;
  }

  return (
    <>
      <div className="enterprise-plan-card">
        <div className="enterprise-plan-card-body">
          <div className="enterprise-plan-details-container">
            <div className="enterprise-plan-name">Enterprise Plan</div>
            <div className="enterprise-plan-description">
              For larger teams and organizations that need additional control.
            </div>
            <div className="enterprise-plan-features-list-container">
              <div>
                {features.slice(0, 4).map((feature, index) => {
                  return (
                    <div key={index} className="enterprise-plan-feature">
                      <img src={"/assets/media/common/check.svg"} alt="check icon" /> {feature}
                    </div>
                  );
                })}
              </div>
              <div>
                {features.slice(4, 8).map((feature, index) => {
                  return (
                    <div key={index} className="enterprise-plan-feature">
                      <img src={"/assets/media/common/check.svg"} alt="check icon" />
                      {feature}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="enterprise-contact-us-container">
            <div className="enterprise-plan-price">Starts at $59</div>
            <RQButton type="primary" size="large" className="mt-16" onClick={() => setIsContactUsModalOpen(true)}>
              Contact sales
            </RQButton>
          </div>
          <div className="enterprise-plan-img-container">
            <img src={"/assets/media/pricing/security.svg"} alt="security" />
          </div>
        </div>
        {/* <div className="enterprise-plan-card-footer">
          Requestly is trusted by <span>50,000+</span> companies globally.
        </div> */}
      </div>

      <ContactUsModal
        isOpen={isContactUsModalOpen}
        onCancel={() => setIsContactUsModalOpen(false)}
        source={SOURCE.PRICING_PAGE}
      />
    </>
  );
};
