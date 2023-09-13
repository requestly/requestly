import { Alert, Col, Row } from "antd";
import { TbInfoTriangle } from "@react-icons/all-files/tb/TbInfoTriangle";
import "./styles.scss";
import { RQButton } from "lib/design-system/components";
import { redirectToPricingPlans } from "utils/RedirectionUtils";
import { useNavigate } from "react-router-dom";
import { trackFeatureLimitUpgradeBannerClicked } from "modules/analytics/events/common/feature-limiter";

const FeatureLimiterBanner = () => {
  const navigate = useNavigate();

  return (
    <Row className="feature-limit-banner-container">
      <Col>
        <Alert
          className="feature-limit-banner"
          message={
            "You've exceeded the usage limits of the free plan. For uninterrupted usage, please upgrade to one of our paid plans."
          }
          icon={<TbInfoTriangle className="feature-limit-banner-icon" />}
          action={
            <RQButton
              className="feature-limit-banner-btn"
              onClick={() => {
                trackFeatureLimitUpgradeBannerClicked();
                redirectToPricingPlans(navigate);
              }}
            >
              Upgrade
            </RQButton>
          }
          showIcon
        />
      </Col>
    </Row>
  );
};

export default FeatureLimiterBanner;
