import { Col, Row, Typography } from "antd";
import React from "react";
import enterpriseImage from "assets/images/illustrations/enterprise-banner.png";
import { RQButton } from "lib/design-system/components";
import checkIcon from "assets/img/icons/common/check.svg";
import { PRICING, PricingFeatures } from "features/pricing";
import underlineIcon from "features/pricing/assets/yellow-highlight.svg";
import { trackEnterprisePlanScheduleMeetButtonClicked } from "./analytics";
import { getFunctions, httpsCallable } from "firebase/functions";
import { EVENTS } from "./analytics";
import "./index.css";

const enterprisePlan = PricingFeatures[PRICING.PRODUCTS.HTTP_RULES].enterprise;

const EnterpriseBanner: React.FC<{ openContactUsModal: () => void }> = ({ openContactUsModal }) => {
  const handleScheduleCallButtonClick = () => {
    trackEnterprisePlanScheduleMeetButtonClicked();
    const salesInboundNotification = httpsCallable(getFunctions(), "premiumNotifications-salesInboundNotification");
    try {
      salesInboundNotification({
        notificationText: EVENTS.ENTERPRISE_PLAN_SCHEDULE_MEET_BUTTON_CLICKED,
      });
    } catch (error) {
      console.error(error);
    }
    openContactUsModal();
  };

  return (
    <Row className="enterprise-banner" gutter={[16, 16]}>
      <Col lg={14} sm={24}>
        <Typography.Title level={2}>Enterprise Plan</Typography.Title>
        <Typography.Title level={5}>
          <span className="enterprise-banner-underline">
            Recommended for larger teams <img src={underlineIcon} alt="highlight" />
          </span>{" "}
          and organizations that need additional control
        </Typography.Title>

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
            <RQButton type="primary" onClick={handleScheduleCallButtonClick}>
              Schedule a call for today
            </RQButton>
          </Col>
        </Row>
      </Col>
      <Col lg={10} sm={24} className="align-self-center text-center enterprise-image">
        <img src={enterpriseImage} height={190} width={200} alt="enterprise-plan" />
      </Col>
    </Row>
  );
};

export default EnterpriseBanner;
