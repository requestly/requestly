import React, { useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import { Col, Row, Space, Tag, Tooltip, Typography } from "antd";
import { RQButton } from "lib/design-system/components";
import { useSelector } from "react-redux";
import { getUserAuthDetails } from "store/selectors";
import { PricingFeatures } from "../../constants/pricingFeatures";
import { PricingPlans } from "../../constants/pricingPlans";
import { PRICING } from "../../constants/pricing";
import ContactUsModal from "components/landing/contactUsModal";
import { capitalize } from "lodash";
import underlineIcon from "../../assets/yellow-highlight.svg";
import checkIcon from "assets/img/icons/common/check.svg";
import { CloseOutlined } from "@ant-design/icons";
import { actions } from "store";
import APP_CONSTANTS from "config/constants";
import TEAM_WORKSPACES from "config/constants/sub/team-workspaces";
import { AUTH } from "modules/analytics/events/common/constants";
import "./index.scss";

interface PricingTableProps {
  product?: string;
  workspaceToUpgrade?: any;
  duration?: string;
  isOpenedFromModal?: boolean;
  handleOnSubscribe?: (planName: string) => void;
}

export const PricingTable: React.FC<PricingTableProps> = ({
  duration = PRICING.DURATION.ANNUALLY,
  workspaceToUpgrade = TEAM_WORKSPACES.PRIVATE_WORKSPACE,
  product = PRICING.PRODUCTS.HTTP_RULES,
  handleOnSubscribe,
  isOpenedFromModal = false,
}) => {
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const [isContactUsModalOpen, setIsContactUsModalOpen] = useState(false);

  const renderButtonsForPlans = useCallback(
    (planName: string) => {
      const { details } = user || {};
      const userPlanType = details?.planDetails?.type;
      const isPrivateWorkspaceSelected = workspaceToUpgrade?.id === TEAM_WORKSPACES.PRIVATE_WORKSPACE.id;
      const userPlanName = details?.planDetails?.planName;

      const shouldRenew = details?.planDetails?.status !== "active" && details?.planDetails?.planName === planName;

      const shouldContactUs =
        (user?.details?.isPremium && userPlanType === "team" && !isPrivateWorkspaceSelected) ||
        (user?.details?.isPremium && userPlanType !== "team" && isPrivateWorkspaceSelected) ||
        (!user?.details?.isPremium && shouldRenew);

      if (planName === PRICING.PLAN_NAMES.FREE) {
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
                isOpenedFromModal
                  ? handleOnSubscribe(planName)
                  : dispatch(
                      actions.toggleActiveModal({
                        modalName: "pricingModal",
                        newValue: true,
                        newProps: { selectedPlan: planName, workspace: workspaceToUpgrade },
                      })
                    )
              }
              type="primary"
            >
              Renew
            </RQButton>
            {<Tag className="current-plan">Expired</Tag>}
          </>
        );
      }

      if (planName === PRICING.PLAN_NAMES.ENTERPRISE) {
        return (
          <RQButton onClick={() => setIsContactUsModalOpen(true)} type="primary">
            Contact us
          </RQButton>
        );
      }

      if (product === PRICING.PRODUCTS.SESSION_REPLAY) {
        if (planName === PRICING.PLAN_NAMES.FREE) {
          return <div className="current-pricing-plan-tag">Current Plan</div>;
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
            isOpenedFromModal
              ? handleOnSubscribe(planName)
              : dispatch(
                  actions.toggleActiveModal({
                    modalName: "pricingModal",
                    newValue: true,
                    newProps: { selectedPlan: planName, workspace: workspaceToUpgrade },
                  })
                )
          }
          disabled={userPlanName === PRICING.PLAN_NAMES.PROFESSIONAL}
          type="primary"
        >
          Upgrade now
        </RQButton>
      );
    },
    [product, user, workspaceToUpgrade, dispatch, handleOnSubscribe, isOpenedFromModal]
  );

  const renderFeaturesListHeader = (planName: string) => {
    return (
      <Row className="pro-basic-feature-title text-left">
        {planName === PRICING.PLAN_NAMES.FREE && (
          <Col>
            <span>
              All you need
              <img src={underlineIcon} alt="highlight" />
            </span>{" "}
            to get started
          </Col>
        )}
        {planName !== PRICING.PLAN_NAMES.FREE && (
          <Col>
            <span>
              Everything <img src={underlineIcon} alt="highlight" />
            </span>{" "}
            in{" "}
            {planName === PRICING.PLAN_NAMES.BASIC || product === PRICING.PRODUCTS.SESSION_REPLAY
              ? capitalize(PRICING.PLAN_NAMES.FREE)
              : planName === PRICING.PLAN_NAMES.PROFESSIONAL
              ? capitalize(PRICING.PLAN_NAMES.BASIC)
              : capitalize(PRICING.PLAN_NAMES.PROFESSIONAL)}{" "}
            plan, and
          </Col>
        )}
      </Row>
    );
  };

  return (
    <>
      <Row wrap={false} className="pricing-table">
        {Object.entries(PricingFeatures[product]).map(([planName, planDetails]) => {
          const planPrice = PricingPlans[planName]?.plans[duration]?.usd?.price;

          if (!isOpenedFromModal && planName === PRICING.PLAN_NAMES.ENTERPRISE) return null;

          return (
            <Col key={planName} className="plan-card">
              <Typography.Text className="plan-name">{capitalize(planDetails.planTitle)}</Typography.Text>
              {planPrice !== undefined && (
                <Row align="middle">
                  <Space size="small">
                    <Typography.Text strong className="plan-price">
                      ${duration === PRICING.DURATION.ANNUALLY ? planPrice / 12 : planPrice}
                    </Typography.Text>
                    {planName !== PRICING.PLAN_NAMES.FREE && <Typography.Text>/ month per member</Typography.Text>}
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
              {planName !== PRICING.PLAN_NAMES.ENTERPRISE && (
                <Row className="mt-8">
                  <Typography.Text type="secondary">
                    {duration === PRICING.DURATION.MONTHLY ? "Billed monthly" : "Billed annually"}
                  </Typography.Text>
                </Row>
              )}
              <Row className="mt-16">{renderButtonsForPlans(planName)}</Row>
              <>{renderFeaturesListHeader(planName)}</>
              <Space direction="vertical" className="plan-features-list">
                {planDetails.features.map((feature, index) => (
                  <div className="text-left plan-feature-item" key={index}>
                    {feature.enabled ? <img src={checkIcon} alt="check" /> : <CloseOutlined />}{" "}
                    <Tooltip title={feature?.tooltip} color="var(--black)">
                      <span className={`${feature?.tooltip ? "plan-feature-underline" : ""}`}>{feature.title}</span>
                    </Tooltip>
                  </div>
                ))}
              </Space>
            </Col>
          );
        })}
      </Row>
      <ContactUsModal
        isOpen={isContactUsModalOpen}
        handleToggleModal={() => setIsContactUsModalOpen(!isContactUsModalOpen)}
      />
    </>
  );
};
