import { Col, Row, Typography } from "antd";
import React from "react";
import enterpriseImage from "assets/images/illustrations/enterprise-banner.png";
import { RQButton } from "lib/design-system/components";
import checkIcon from "assets/img/icons/common/check.svg";
import { PRICING, PricingFeatures } from "features/pricing";
import underlineIcon from "features/pricing/assets/yellow-highlight.svg";

const enterprisePlan = PricingFeatures[PRICING.PRODUCTS.HTTP_RULES].enterprise;

const EnterpriseBanner: React.FC<{ openContactUsModal: () => void }> = ({ openContactUsModal }) => {
  return (
    <Row className="enterprise-banner">
      <Col lg={19} sm={20}>
        <Typography.Title level={2}>Enterprise Plan</Typography.Title>
        <Typography.Title level={5}>
          <span className="enterprise-banner-underline">
            For larger teams <img src={underlineIcon} alt="highlight" />
          </span>{" "}
          and organizations that need additional control
        </Typography.Title>
        {/* <Typography.Text>{enterprisePlan.planDescription}</Typography.Text> */}
        <br />
        <div className="enterprise-features-grid">
          {enterprisePlan.features.map((feature, index) => (
            <div className="text-left" key={index}>
              <img src={checkIcon} alt="check" />
              <span>{feature.title}</span>
            </div>
          ))}
        </div>
        <br />
        <Row className="mt-1">
          <Col className="mr-16">
            <span className="text-bold title">Starts at $59</span>
          </Col>
          <Col>
            <RQButton type="primary" onClick={openContactUsModal}>
              Schedule a call
            </RQButton>
          </Col>
        </Row>
      </Col>
      <Col className="align-self-center">
        <img src={enterpriseImage} height={190} width={200} alt="enterprise-plan" />
      </Col>
    </Row>
  );
};

export default EnterpriseBanner;
