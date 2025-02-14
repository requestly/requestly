import React from "react";
import { Col, Row, Typography } from "antd";

const companyLogos = [
  "/assets/media/common/indeed.svg",
  "/assets/media/common/atnt.svg",
  "/assets/media/common/verizon.svg",
  "/assets/media/common/intuit.svg",
];

export const CompaniesLogoBanner: React.FC = () => {
  return (
    <>
      <Row style={{ marginTop: "40px" }}>
        <Typography.Text className="banner-text-small" style={{ fontWeight: "500" }}>
          Trusted by developers & QA teams from 50,000+ organizations
        </Typography.Text>
      </Row>
      <Row align="middle" gutter={16} className="mt-16">
        {companyLogos.map((logo) => (
          <Col>
            <img src={logo} className="banner-company-logo" alt="company logo" />
          </Col>
        ))}
      </Row>
    </>
  );
};
