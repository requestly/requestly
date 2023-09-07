import { Alert, Col, Row } from "antd";
import { TbInfoTriangle } from "@react-icons/all-files/tb/TbInfoTriangle";
import "./styles.scss";
import { RQButton } from "lib/design-system/components";

const FeatureLimiterBanner = () => {
  return (
    <Row className="feature-limit-banner-container">
      <Col>
        <Alert
          className="feature-limit-banner"
          message={
            "You've exceeded the usage limits of the free plan. For uninterrupted usage, please upgrade to one of our paid plans."
          }
          icon={<TbInfoTriangle className="feature-limit-banner-icon" />}
          action={<RQButton className="feature-limit-banner-btn">Upgrade</RQButton>}
          showIcon
        />
      </Col>
    </Row>
  );
};

export default FeatureLimiterBanner;
