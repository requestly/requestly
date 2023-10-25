import React from "react";
import { Col, Row, Space, Typography } from "antd";
import { PricingFeatures } from "../../constants/pricingFeatures";
import { PricingPlans } from "../../constants/pricingPlans";
import { capitalize } from "lodash";
import APP_CONSTANTS from "config/constants";
import "./index.scss";

const PricingTable: React.FC = () => {
  return (
    <Row wrap={false} className="pricing-table">
      {Object.entries(PricingFeatures[APP_CONSTANTS.PRICING.PRODUCTS.HTTP_RULES]).map(([planName, planDetails]) => {
        const planPrice = PricingPlans[planName as keyof typeof PricingPlans]?.plans["annually"]?.usd?.price;
        return (
          <Col key={planName} className="plan-card">
            <Typography.Text className="plan-name">{capitalize(planName)}</Typography.Text>
            {planPrice !== undefined && (
              <Row align="middle">
                <Space size="small">
                  <Typography.Text strong className="plan-price">
                    ${planPrice / 12}
                  </Typography.Text>
                  <Typography.Text>/ month per member</Typography.Text> {/*TODO: Hide this for free plan */}
                </Space>
              </Row>
            )}
            {planDetails?.planDescription && (
              <Row>
                <Typography.Text type="secondary" className="plan-description">
                  {planDetails.planDescription}
                </Typography.Text>
              </Row>
            )}
          </Col>
        );
      })}
    </Row>
  );
};

export default PricingTable;
