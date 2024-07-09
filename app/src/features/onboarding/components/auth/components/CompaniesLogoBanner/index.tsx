import React from "react";
import { Col, Row, Typography } from "antd";
import indeedLogo from "assets/img/icons/common/indeed.svg";
import atntLogo from "assets/img/icons/common/atnt.svg";
import verizonLogo from "assets/img/icons/common/verizon.svg";
import intuitLogo from "assets/img/icons/common/intuit.svg";

const companyLogos = [indeedLogo, atntLogo, verizonLogo, intuitLogo];

export const CompaniesLogoBanner: React.FC = () => {
  return (
    <>
      <Row style={{ marginTop: "60px" }}>
        <Typography.Text className="banner-text-small" style={{ fontWeight: "500", color: "var(--white)" }}>
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
