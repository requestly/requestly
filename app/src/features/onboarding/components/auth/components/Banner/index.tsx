import { Col, Row, Typography } from "antd";
import underlineIcon from "assets/images/illustrations/yellow-highlight.svg";
import { MdCheck } from "@react-icons/all-files/md/MdCheck";
import indeedLogo from "assets/img/icons/common/indeed.svg";
import atntLogo from "assets/img/icons/common/atnt.svg";
import verizonLogo from "assets/img/icons/common/verizon.svg";
import intuitLogo from "assets/img/icons/common/intuit.svg";
import { MdOutlineCreditCardOff } from "@react-icons/all-files/md/MdOutlineCreditCardOff";
import "./index.scss";
import { useFeatureValue } from "@growthbook/growthbook-react";

const features = [
  "Modify API response",
  "Modify request body",
  "Inject custom scripts",
  "Modify GraphQL response",
  "Apply multiple modifications to a single request",
];

const companyLogos = [indeedLogo, atntLogo, verizonLogo, intuitLogo];

export const OnboardingAuthBanner = () => {
  const trialDuration = useFeatureValue("trial_days_duration", 30);

  return (
    <Col className="auth-banner">
      <div className="banner-no-cc-required text-bold">
        <MdOutlineCreditCardOff />
        <span>No credit card required!</span>
      </div>
      <Typography.Title level={3}>
        Get {trialDuration} days free access to all{" "}
        <span className="banner-title-highlight">
          premium <img src={underlineIcon} alt="highlight" />
        </span>{" "}
        features
      </Typography.Title>
      <Typography.Text className="banner-text-small">
        Premium features you can access in the free trial:
      </Typography.Text>
      {features.map((feature) => (
        <Row className="banner-premium-feature-list-item">
          <MdCheck />
          {feature}
        </Row>
      ))}
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
    </Col>
  );
};
