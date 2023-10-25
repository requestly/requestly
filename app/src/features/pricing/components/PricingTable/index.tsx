import React, { useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import { Col, Row, Space, Tag, Typography } from "antd";
import { RQButton } from "lib/design-system/components";
import { useSelector } from "react-redux";
import { getUserAuthDetails } from "store/selectors";
import { PricingFeatures } from "../../constants/pricingFeatures";
import { PricingPlans } from "../../constants/pricingPlans";
import { capitalize } from "lodash";
import { redirectToCheckout } from "utils/RedirectionUtils";
import underlineIcon from "../../assets/yellow-highlight.svg";
import checkIcon from "assets/img/icons/common/check.svg";
import { CloseOutlined } from "@ant-design/icons";
import { actions } from "store";
import APP_CONSTANTS from "config/constants";
import { AUTH } from "modules/analytics/events/common/constants";
import "./index.scss";

interface PricingTableProps {
  product?: string;
  workspaceToUpgrade?: any;
  duration?: string;
}

const PRIVATE_WORKSPACE = {
  name: APP_CONSTANTS.TEAM_WORKSPACES.NAMES.PRIVATE_WORKSPACE,
  id: "private_workspace",
  accessCount: 1,
};

const PricingTable: React.FC<PricingTableProps> = ({
  duration = "annually",
  workspaceToUpgrade = PRIVATE_WORKSPACE,
  product = APP_CONSTANTS.PRICING.PRODUCTS.HTTP_RULES,
}) => {
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const [, setIsContactUsModalOpen] = useState(false);

  const renderButtonsForPlans = useCallback(
    (planName: string) => {
      const { details } = user || {};
      const userPlanType = details?.planDetails?.type;
      const isPrivateWorkspaceSelected = workspaceToUpgrade?.id === PRIVATE_WORKSPACE.id;
      const userPlanName = details?.planDetails?.planName;

      const shouldRenew = details?.planDetails?.status !== "active" && details?.planDetails?.planName === planName;

      const shouldContactUs =
        (user?.details?.isPremium && userPlanType === "team" && !isPrivateWorkspaceSelected) ||
        (user?.details?.isPremium && userPlanType !== "team" && isPrivateWorkspaceSelected) ||
        (!user?.details?.isPremium && shouldRenew);

      if (planName === APP_CONSTANTS.PRICING.PLAN_NAMES.FREE) {
        if (!user?.details?.isLoggedIn) {
          return (
            <>
              <RQButton
                onClick={() =>
                  dispatch(
                    actions.toggleActiveModal({
                      modalName: "authModal",
                      newValue: true,
                      newProps: {
                        redirectURL: window.location.href,
                        authMode: APP_CONSTANTS.AUTH.ACTION_LABELS.SIGN_UP,
                        eventSource: AUTH.SOURCE.PRICING_PAGE,
                      },
                    })
                  )
                }
                type="primary"
              >
                Signup
              </RQButton>
            </>
          );
        }
      }

      if (planName === userPlanName) {
        return <div className="current-pricing-plan-tag">Current Plan</div>;
      }

      if (shouldContactUs) {
        return (
          <RQButton onClick={() => setIsContactUsModalOpen(true)} type="primary">
            Contact us
          </RQButton>
        );
      }

      if (shouldRenew) {
        return (
          <>
            <RQButton
              onClick={() =>
                redirectToCheckout({
                  mode: isPrivateWorkspaceSelected ? "individual" : "team",
                  planName: planName,
                  duration: duration,
                  quantity: workspaceToUpgrade?.accessCount,
                  teamId: isPrivateWorkspaceSelected ? null : workspaceToUpgrade?.id,
                })
              }
              type="primary"
            >
              Renew
            </RQButton>
            {<Tag className="current-plan">Expired</Tag>}
          </>
        );
      }

      if (product === APP_CONSTANTS.PRICING.PRODUCTS.SESSION_REPLAY) {
        if (planName === APP_CONSTANTS.PRICING.PLAN_NAMES.FREE) {
          return (
            <>
              <div className="current-pricing-plan-tag">Current Plan</div>
            </>
          );
        }

        return (
          <RQButton onClick={() => setIsContactUsModalOpen(true)} type="primary">
            Contact us
          </RQButton>
        );
      }

      return (
        <RQButton
          onClick={() =>
            redirectToCheckout({
              mode: isPrivateWorkspaceSelected ? "individual" : "team",
              planName: planName,
              duration: duration,
              quantity: workspaceToUpgrade?.accessCount,
              teamId: isPrivateWorkspaceSelected ? null : workspaceToUpgrade?.id,
            })
          }
          disabled={userPlanName === APP_CONSTANTS.PRICING.PLAN_NAMES.PROFESSIONAL}
          type="primary"
        >
          Upgrade now
        </RQButton>
      );
    },
    [duration, product, user, workspaceToUpgrade, dispatch]
  );

  const renderFeaturesListHeader = (planName: string) => {
    return (
      <Row className="pro-basic-feature-title text-left">
        {planName === APP_CONSTANTS.PRICING.PLAN_NAMES.FREE && (
          <Col>
            <span>
              All you need
              <img src={underlineIcon} alt="highlight" />
            </span>{" "}
            to get started
          </Col>
        )}
        {planName !== APP_CONSTANTS.PRICING.PLAN_NAMES.FREE && (
          <Col>
            <span>
              Everything <img src={underlineIcon} alt="highlight" />
            </span>{" "}
            in{" "}
            {planName === APP_CONSTANTS.PRICING.PLAN_NAMES.BASIC ||
            product === APP_CONSTANTS.PRICING.PRODUCTS.SESSION_REPLAY
              ? "Free"
              : planName === APP_CONSTANTS.PRICING.PLAN_NAMES.PROFESSIONAL
              ? "Basic"
              : "Pro"}{" "}
            plan, and
          </Col>
        )}
      </Row>
    );
  };

  return (
    <Row wrap={false} className="pricing-table">
      {Object.entries(PricingFeatures[APP_CONSTANTS.PRICING.PRODUCTS.HTTP_RULES]).map(([planName, planDetails]) => {
        const planPrice = PricingPlans[planName as keyof typeof PricingPlans]?.plans["annually"]?.usd?.price;
        return (
          <Col key={planName} className="plan-card">
            <Typography.Text className="plan-name">{capitalize(planName)}</Typography.Text>
            {planPrice !== undefined && (
              <Row align="middle">
                <Space size="small">
                  <Typography.Text strong className="plan-price">
                    ${planPrice / 12}
                  </Typography.Text>
                  {planName !== APP_CONSTANTS.PRICING.PLAN_NAMES.FREE && (
                    <Typography.Text>/ month per member</Typography.Text>
                  )}
                </Space>
              </Row>
            )}
            {planDetails?.planDescription && (
              <Row>
                <Typography.Text type="secondary" className="plan-description">
                  {planDetails.planDescription}
                </Typography.Text>
              </Row>
            )}
            {planName !== APP_CONSTANTS.PRICING.PLAN_NAMES.ENTERPRISE && (
              <Row className="mt-8">
                <Typography.Text type="secondary">Billed annually</Typography.Text>
              </Row>
            )}
            <Row className="mt-16">{renderButtonsForPlans(planName)}</Row>
            <>{renderFeaturesListHeader(planName)}</>
            <Space direction="vertical" className="plan-features-list">
              {planDetails.features.map((feature, index) => (
                <div className="text-left text-gray plan-feature-item" key={index}>
                  {feature.enabled ? <img src={checkIcon} alt="check" /> : <CloseOutlined />} {feature.title}
                </div>
              ))}
            </Space>
          </Col>
        );
      })}
    </Row>
  );
};

export default PricingTable;
