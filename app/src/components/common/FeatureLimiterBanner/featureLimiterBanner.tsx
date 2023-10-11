import { Alert, Col, Row } from "antd";
import { TbInfoTriangle } from "@react-icons/all-files/tb/TbInfoTriangle";
import "./styles.scss";
import { RQButton } from "lib/design-system/components";
import { redirectToPricingPlans } from "utils/RedirectionUtils";
import { useNavigate } from "react-router-dom";
import {
  trackFeatureLimitUpgradeBannerClicked,
  trackFeatureLimitUpgradeBannerViewed,
} from "modules/analytics/events/common/feature-limiter";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { getUserAuthDetails } from "store/selectors";
import APP_CONSTANTS from "config/constants";

const FeatureLimiterBanner = () => {
  const navigate = useNavigate();
  const user = useSelector(getUserAuthDetails);
  const isUserOnFreePlan =
    !user?.details?.planDetails?.planName ||
    user?.details?.planDetails?.planName == APP_CONSTANTS.PRICING.PLAN_NAMES.FREE
      ? true
      : false;
  const userPlan = user?.details?.planDetails?.planName ?? APP_CONSTANTS.PRICING.PLAN_NAMES.FREE;

  useEffect(() => {
    trackFeatureLimitUpgradeBannerViewed();
  }, []);

  return (
    <Row className="feature-limit-banner-container">
      <Col>
        <Alert
          className="feature-limit-banner"
          message={
            isUserOnFreePlan
              ? "You've exceeded the usage limits of the free plan. For uninterrupted usage, please upgrade to one of our paid plans."
              : `You've exceeded the usage limits of the ${userPlan} plan. For uninterrupted usage, please upgrade to Professional plan`
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
