import { Col, Row, Typography } from "antd";
import underlineIcon from "assets/images/illustrations/yellow-highlight.svg";
import { MdCheck } from "@react-icons/all-files/md/MdCheck";
import indeedLogo from "assets/img/icons/common/indeed.svg";
import atntLogo from "assets/img/icons/common/atnt.svg";
import verizonLogo from "assets/img/icons/common/verizon.svg";
import intuitLogo from "assets/img/icons/common/intuit.svg";
import "./index.scss";

const features = [
  "Work from anywhere - Sync Requestly rules & other configurations across devices",
  "Access your organization's resources, including team workspaces, shared rules and mocks.",
  "Use All features like HTTP Sessions, API Mocks, Overriding API Responses, etc.",
  "Join a Community trusted by over 200,000 customers worldwide from over 10,000",
  "It's Free!",
];

const companyLogos = [indeedLogo, atntLogo, verizonLogo, intuitLogo];

export const OnboardingAuthBanner = () => {
  return (
    <Col className="auth-banner">
      <Typography.Title level={3}>
        <span className="banner-title-highlight">
          Why Sign Up ? <img src={underlineIcon} alt="highlight" />
        </span>
      </Typography.Title>
      <div className="mt-20">
        {features.map((feature) => (
          <Row className="banner-premium-feature-list-item">
            <MdCheck />
            <span className="feature-text">{feature}</span>
          </Row>
        ))}
      </div>
      <Row style={{ marginTop: "60px" }}>
        <Typography.Text className="banner-text-small" style={{ fontWeight: "500", color: "var(--white)" }}>
          Trusted by developers & QA teams from 5000+ organizations
        </Typography.Text>
      </Row>
      <Row align="middle" gutter={16} className="mt-16">
        {companyLogos.map((logo) => (
          <Col>
            <img src={logo} className="banner-company-logo" alt="company logo" />
          </Col>
        ))}
      </Row>
    </Col>
  );
};
