import { Col, Row, Typography } from "antd";
import React from "react";
import enterpriseImage from "assets/images/illustrations/enterprise-banner.png";
import { RQButton } from "lib/design-system/components";
import checkIcon from "assets/img/icons/common/check.svg";

const enterpriseFeatures = [
  "Everything in Pro plan",
  "Unlimited Everything",
  "API access",
  "On Premise Support",
  "Single Sign-On",
  "Priority Support - Slack Connect, Email, Chat",
];

const EnterpriseBanner: React.FC<{ openContactUsModal: () => void }> = ({ openContactUsModal }) => {
  return (
    <Row className="enterprise-banner">
      <Col span={14}>
        <Typography.Title level={2}>Enterprise Plan</Typography.Title>
        <Typography.Text>
          Empower your team with our Enterprise Plan, designed to seamlessly scale with your ambitions and drive
          collaborative success
        </Typography.Text>
        <br />
        <div className="enterprise-features-grid">
          {enterpriseFeatures.map((feature, index) => (
            <div className="text-left text-gray" key={index}>
              <img src={checkIcon} alt="check" />
              <span>{feature}</span>
            </div>
          ))}
        </div>
        <RQButton type="primary" className="mt-1" onClick={openContactUsModal}>
          Contact Us
        </RQButton>
      </Col>
      <Col offset={2}>
        <img src={enterpriseImage} height={280} width={330} alt="enterprise" />
      </Col>
    </Row>
  );
};

export default EnterpriseBanner;
