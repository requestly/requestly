import React, { RefObject } from "react";
import { Row } from "antd";
import { PricingFeatures } from "../../constants/pricingFeatures";
import { PricingPlans } from "../../constants/pricingPlans";
import { PRICING } from "../../constants/pricing";
import { PlanColumn } from "./components/PlanColumn";
import "./index.scss";
import { kebabCase } from "lodash";

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
  return (
    <>
      <Row wrap={false} className={`pricing-table ${kebabCase(product)}`} ref={tableRef}>
        {Object.entries(PricingFeatures[product]).map(([planName, planDetails]) => {
          const planPrice = PricingPlans[planName]?.plans[duration]?.usd?.price;

          // Do not show Free plan in upgrade modal for HTTP Rules
          if (isOpenedFromModal && planName === PRICING.PLAN_NAMES.FREE && product !== PRICING.PRODUCTS.API_CLIENT)
            return null;

          // Hide Enterprise Plan for HTTP Rules from main pricing page.
          // We render it separately
          if (
            !isOpenedFromModal &&
            product !== PRICING.PRODUCTS.API_CLIENT &&
            planName === PRICING.PLAN_NAMES.ENTERPRISE
          ) {
            return null;
          }

          return (
            <PlanColumn
              key={planName}
              planName={planName}
              planDetails={planDetails}
              planPrice={planPrice}
              duration={duration}
              product={product}
              source={source}
              isOpenedFromModal={isOpenedFromModal}
            />
          );
        })}
      </Row>
    </>
  );
};
