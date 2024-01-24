import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getUserAuthDetails } from "store/selectors";
import { Col, Row, Space } from "antd";
import { getAvailableBillingTeams } from "store/features/billing/selectors";
import { TeamPlanStatus } from "../TeamPlanStatus";
import { RQButton } from "lib/design-system/components";
import { getLongFormatDateString } from "utils/DateTimeUtils";
import { getPrettyPlanName } from "utils/FormattingHelper";
import { getPlanNameFromId } from "utils/PremiumUtils";
import { MdDiversity1 } from "@react-icons/all-files/md/MdDiversity1";
import UpgradeIcon from "../../assets/upgrade.svg";
import { actions } from "store";
import { PRICING } from "features/pricing";
import Logger from "lib/logger";
import APP_CONSTANTS from "config/constants";
import { useEffect, useState } from "react";
import "./index.scss";

export const UserPlanDetails = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const billingTeams = useSelector(getAvailableBillingTeams);
  const [daysLeft, setDaysLeft] = useState(0);

  console.log({ user });

  useEffect(() => {
    try {
      const diffTime = new Date(user?.details?.planDetails?.subscription?.endDate).getTime() - new Date().getTime();
      const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setDaysLeft(daysLeft);
    } catch (err) {
      Logger.log(err);
    }
  }, [user?.details?.planDetails?.subscription?.endDate]);

  return (
    <Col
      className="billing-teams-primary-card user-plan-detail-card"
      style={{
        marginTop: !user?.details?.isPremium ? "80px" : "0px",
      }}
    >
      {user?.details?.isPremium ? (
        <>
          {" "}
          <Row gutter={8} align="middle" className="user-plan-card-header">
            <Col className="text-white text-bold">Your plan</Col>
            <Col>
              <TeamPlanStatus subscriptionStatus={user?.details?.planDetails.status} />
            </Col>
          </Row>
          <Col className="user-plan-card-grid">
            <div className="user-plan-card-grid-item">
              <Space direction="vertical" size={8}>
                {user?.details?.planDetails.status === "trialing" ? <div>One month free trial</div> : null}

                <div className="user-plan-card-plan-name">
                  {getPrettyPlanName(getPlanNameFromId(user?.details?.planDetails?.planName))} plan
                </div>
              </Space>
            </div>
            <div className="user-plan-card-grid-item">
              <Space direction="vertical" size={8}>
                <div className="user-plan-card-grid-item-label">
                  {user?.details?.planDetails.status === "trialing" ? "Trial" : "Plan"} start date
                </div>
                <div className="user-plan-date">
                  {getLongFormatDateString(new Date(user?.details?.planDetails?.subscription?.startDate))}
                </div>
              </Space>
            </div>
            <div className="user-plan-card-grid-item">
              <Space direction="vertical" size={8}>
                <div className="user-plan-card-grid-item-label">
                  {user?.details?.planDetails.status === "trialing" ? "Trial" : "Plan"} expire date
                </div>
                <div className="user-plan-date">
                  {getLongFormatDateString(new Date(user?.details?.planDetails?.subscription?.endDate))}
                </div>
              </Space>
            </div>
          </Col>
        </>
      ) : null}
      {user?.details?.planDetails?.planName !== PRICING.PLAN_NAMES.PROFESSIONAL ||
      user?.details?.planDetails.status === "trialing" ? (
        <Col className="user-plan-upgrade-card">
          <MdDiversity1 />
          <div className="title">
            {!user?.details?.isPremium ? "You don't have any plan. " : ""}Upgrade for more features 🚀
          </div>
          <div className="user-plan-upgrade-card-description">
            {user?.details?.planDetails.status === "trialing" ? (
              <>
                Your professional plan free trail will expire in {daysLeft} days.{" "}
                {billingTeams.length
                  ? "Please consider upgrading or connect directly with billing team admins already enjoying premium features."
                  : "Get access to premium rule types and extended rule limits"}
              </>
            ) : (
              <>
                Upgrade for premium features. You can also join an existing billing team or ask your organization admin
                to switch you to a paid plan.
              </>
            )}
          </div>
          <Row className="mt-16" gutter={8} align="middle">
            {billingTeams.length ? (
              <Col>
                <RQButton
                  type="default"
                  onClick={() => {
                    navigate(APP_CONSTANTS.PATHS.SETTINGS.BILLING.RELATIVE + "/" + billingTeams[0].id);
                  }}
                >
                  Join a paid team
                </RQButton>
              </Col>
            ) : null}
            <Col>
              <RQButton
                className="user-plan-upgrade-card-btn"
                icon={<img src={UpgradeIcon} alt="upgrade" />}
                type="primary"
                onClick={() => {
                  dispatch(
                    actions.toggleActiveModal({
                      modalName: "pricingModal",
                      newValue: true,
                      newProps: { selectedPlan: null, source: "user_plan_billing_team" },
                    })
                  );
                }}
              >
                Upgrade
              </RQButton>
            </Col>
          </Row>
        </Col>
      ) : null}
    </Col>
  );
};
