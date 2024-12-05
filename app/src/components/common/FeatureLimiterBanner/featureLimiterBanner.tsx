import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { Alert, Col, Row } from "antd";
import { RQButton } from "lib/design-system/components";
import { TbInfoTriangle } from "@react-icons/all-files/tb/TbInfoTriangle";
import { globalActions } from "store/slices/global/slice";
import { PRICING } from "features/pricing";
import { trackFeatureLimitUpgradeBannerViewed } from "modules/analytics/events/common/feature-limiter";
import { trackViewPricingPlansClicked } from "modules/analytics/events/common/pricing";
import { getPrettyPlanName } from "utils/FormattingHelper";
import "./styles.scss";

const FeatureLimiterBanner = () => {
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const isUserOnFreePlan =
    !user?.details?.planDetails?.planName || user?.details?.planDetails?.planName === PRICING.PLAN_NAMES.FREE;
  const userPlan = user?.details?.planDetails?.planName ?? PRICING.PLAN_NAMES.FREE;

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
              : `You've exceeded the usage limits of the ${getPrettyPlanName(
                  userPlan
                )} plan. For uninterrupted usage, please upgrade to Professional plan`
          }
          icon={<TbInfoTriangle className="feature-limit-banner-icon" />}
          action={
            <RQButton
              className="feature-limit-banner-btn"
              onClick={() => {
                trackViewPricingPlansClicked("feature_limiter_banner");
                dispatch(
                  globalActions.toggleActiveModal({
                    modalName: "pricingModal",
                    newValue: true,
                    newProps: { selectedPlan: null, source: "feature_limiter_banner" },
                  })
                );
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
