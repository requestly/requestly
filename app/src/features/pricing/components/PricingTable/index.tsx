import React, { RefObject, useState } from "react";
import { Row } from "antd";
import { PricingFeatures } from "../../constants/pricingFeatures";
import { PricingPlans } from "../../constants/pricingPlans";
import { PRICING } from "../../constants/pricing";
import { ContactUsModal } from "componentsV2/modals/ContactUsModal";
import { PlanColumn } from "./components/PlanColumn";
import "./index.scss";

interface PricingTableProps {
  product?: string;
  duration?: string;
  isOpenedFromModal?: boolean;
  tableRef?: RefObject<HTMLDivElement>;
  source: string;
}

export const PricingTable: React.FC<PricingTableProps> = ({
  duration = PRICING.DURATION.ANNUALLY,
  product = PRICING.PRODUCTS.HTTP_RULES,
  source,
  tableRef = null,
  isOpenedFromModal = false,
}) => {
  const [isContactUsModalOpen, setIsContactUsModalOpen] = useState(false);

  return (
    <>
      <Row wrap={false} className="pricing-table" ref={tableRef}>
        {Object.entries(PricingFeatures[product]).map(([planName, planDetails]) => {
          const planPrice = PricingPlans[planName]?.plans[duration]?.usd?.price;

          if (isOpenedFromModal && planName === PRICING.PLAN_NAMES.FREE) return null;

          if (!isOpenedFromModal && planName === PRICING.PLAN_NAMES.ENTERPRISE) return null;

          return (
            <PlanColumn
              key={planName}
              planName={planName}
              planDetails={planDetails}
              planPrice={planPrice}
              duration={duration}
              product={product}
              source={source}
              setIsContactUsModalOpen={setIsContactUsModalOpen}
              isOpenedFromModal={isOpenedFromModal}
            />
          );
        })}
      </Row>
      <ContactUsModal
        isOpen={isContactUsModalOpen}
        onCancel={() => setIsContactUsModalOpen(false)}
        heading="Get In Touch"
        subHeading="Learn about the benefits & pricing of team plan"
        source="pricing_table"
      />
    </>
  );
};
