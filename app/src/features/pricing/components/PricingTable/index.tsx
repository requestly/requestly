import React, { RefObject, useCallback, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Col, Row, Space, Tooltip, Typography } from "antd";
import { RQButton } from "lib/design-system/components";
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
import { getPlanNameFromId } from "utils/PremiumUtils";
import "./index.scss";
import { getFunctions, httpsCallable } from "firebase/functions";
import { toast } from "utils/Toast";
import { trackCheckoutFailedEvent, trackCheckoutInitiatedEvent } from "modules/analytics/events/misc/business/checkout";

interface PricingTableProps {
  product?: string;
  workspaceToUpgrade?: any;
  duration?: string;
  isOpenedFromModal?: boolean;
  tableRef?: RefObject<HTMLDivElement>;
  source: string;
  handleOnSubscribe?: (planName: string) => void;
}

export const PricingTable: React.FC<PricingTableProps> = ({
  duration = PRICING.DURATION.ANNUALLY,
  workspaceToUpgrade = TEAM_WORKSPACES.PRIVATE_WORKSPACE,
  product = PRICING.PRODUCTS.HTTP_RULES,
  source,
  handleOnSubscribe,
  tableRef = null,
  isOpenedFromModal = false,
}) => {
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);

  const [isContactUsModalOpen, setIsContactUsModalOpen] = useState(false);
  const [clickedPlanName, setClickedPlanName] = useState("");

  const manageSubscription = useMemo(() => httpsCallable(getFunctions(), "subscription-manageSubscription"), []);

  const renderButtonsForPlans = useCallback(
    (planName: string) => {
      const isUserPremium = user?.details?.isPremium;
      const userPlanName = user?.details?.planDetails?.planName;
      const userPlanType = user?.details?.planDetails?.type;
      const userExpiredPlanName = !["active", "trialing", "past_due"].includes(user?.details?.planDetails?.status)
        ? getPlanNameFromId(user?.details?.planDetails?.planId)
        : null;
      const isPrivateWorkspaceSelected = workspaceToUpgrade?.id === TEAM_WORKSPACES.PRIVATE_WORKSPACE.id;
      const isUserTrialing = user?.details?.planDetails?.status === "trialing";

      const redirectToManageSubscription = () => {
        setClickedPlanName(planName);
        manageSubscription({
          planName,
          duration,
        })
          .then((res: any) => {
            if (res?.data?.success) {
              window.location.href = res?.data?.data?.portalUrl;
            }
            setClickedPlanName("");
          })
          .catch((err) => {
            toast.error("Error in managing subscription. Please contact support contact@requestly.io");
            trackCheckoutFailedEvent(isPrivateWorkspaceSelected ? "individual" : "team", source);
            setClickedPlanName("");
          });
      };

      const handleOnUpgradeClick = () => {
        if (!user?.details?.isLoggedIn) {
          dispatch(actions.toggleActiveModal({ modalName: "authModal", newValue: true }));
          return;
        } else if (userPlanType === "team" && isUserPremium) {
          setIsContactUsModalOpen(true);
        } else if (isUserPremium && isPrivateWorkspaceSelected) {
          redirectToManageSubscription();
        } else if (isOpenedFromModal) {
          handleOnSubscribe(planName);
        } else {
          dispatch(
            actions.toggleActiveModal({
              modalName: "pricingModal",
              newValue: true,
              newProps: {
                selectedPlan: planName,
                workspace: workspaceToUpgrade,
                planDuration: duration,
                source: "pricing_table",
              },
            })
          );
        }
        trackCheckoutInitiatedEvent(duration, planName, workspaceToUpgrade?.accessCount, isUserTrialing, source);
      };

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

        return (
          <Space size={8} className={userPlanName !== PRICING.PLAN_NAMES.FREE ? "visibility-hidden" : ""}>
            <RQButton onClick={() => (window.location.href = "/")} type="primary">
              Use now
            </RQButton>
            <div className="current-pricing-plan-tag">Current Plan</div>
          </Space>
        );
      }

      if (planName === PRICING.PLAN_NAMES.ENTERPRISE) {
        return (
          <RQButton onClick={() => setIsContactUsModalOpen(true)} type="primary">
            Contact us
          </RQButton>
        );
      }

      if (isUserTrialing && isPrivateWorkspaceSelected) {
        return (
          <Space size={8}>
            <RQButton
              loading={clickedPlanName === planName}
              onClick={() => {
                redirectToManageSubscription();
                trackCheckoutInitiatedEvent(
                  duration,
                  planName,
                  workspaceToUpgrade?.accessCount,
                  isUserTrialing,
                  source
                );
              }}
              type="primary"
            >
              Upgrade
            </RQButton>
            {planName === userPlanName && <div className="current-pricing-plan-tag">30 days trial active</div>}
          </Space>
        );
      }

      if (isUserPremium && !isUserTrialing) {
        if (userPlanType !== "team" && !isPrivateWorkspaceSelected) {
          return (
            <RQButton onClick={() => setIsContactUsModalOpen(true)} type="primary">
              Contact us
            </RQButton>
          );
        }
      } else {
        if (userExpiredPlanName === planName) {
          if (
            (userPlanType === "individual" && isPrivateWorkspaceSelected) ||
            (userPlanType === "team" && !isPrivateWorkspaceSelected)
          ) {
            return (
              <Space size={8}>
                <RQButton
                  onClick={() =>
                    isOpenedFromModal
                      ? handleOnSubscribe(planName)
                      : dispatch(
                          actions.toggleActiveModal({
                            modalName: "pricingModal",
                            newValue: true,
                            newProps: {
                              selectedPlan: planName,
                              workspace: workspaceToUpgrade,
                              planDuration: duration,
                              source: "pricing_table",
                            },
                          })
                        )
                  }
                  type="primary"
                >
                  Renew
                </RQButton>
                {<div className="current-pricing-plan-tag">Expired</div>}
              </Space>
            );
          }
        }
      }

      if (product === PRICING.PRODUCTS.SESSION_REPLAY) {
        if (planName === PRICING.PLAN_NAMES.FREE) {
          return (
            <Space size={8}>
              <RQButton onClick={() => (window.location.href = "/")} type="primary">
                Use now
              </RQButton>
              <div className="current-pricing-plan-tag">Current Plan</div>
            </Space>
          );
        }

        return (
          <RQButton onClick={() => setIsContactUsModalOpen(true)} type="primary">
            Contact us
          </RQButton>
        );
      }

      if (isUserPremium && planName === userPlanName && !isUserTrialing) {
        return (
          <div className="current-pricing-plan-tag">
            {userPlanType === "team" && isPrivateWorkspaceSelected ? "Already included in team plan" : "Current plan"}
          </div>
        );
      }

      return (
        <RQButton
          loading={clickedPlanName === planName}
          onClick={handleOnUpgradeClick}
          disabled={isUserPremium && userPlanName === PRICING.PLAN_NAMES.PROFESSIONAL && !isUserTrialing}
          type="primary"
          className={
            isUserPremium && userPlanName === PRICING.PLAN_NAMES.PROFESSIONAL && !isUserTrialing
              ? "visibility-hidden"
              : ""
          }
        >
          Upgrade
        </RQButton>
      );
    },
    [
      user?.details?.isPremium,
      user?.details?.planDetails?.planName,
      user?.details?.planDetails?.type,
      user?.details?.planDetails?.status,
      user?.details?.planDetails?.planId,
      user?.details?.isLoggedIn,
      workspaceToUpgrade,
      product,
      clickedPlanName,
      manageSubscription,
      duration,
      isOpenedFromModal,
      dispatch,
      handleOnSubscribe,
    ]
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
      <Row wrap={false} className="pricing-table" ref={tableRef}>
        {Object.entries(PricingFeatures[product]).map(([planName, planDetails]) => {
          const planPrice = PricingPlans[planName]?.plans[duration]?.usd?.price;

          if (!isOpenedFromModal && planName === PRICING.PLAN_NAMES.ENTERPRISE) return null;

          return (
            <Col
              key={planName}
              className={`plan-card ${planName === PRICING.PLAN_NAMES.PROFESSIONAL ? "recommended-plan-card" : ""}`}
            >
              <Space size={8}>
                <Typography.Text className="plan-name">{capitalize(planDetails.planTitle)}</Typography.Text>
                {planName === PRICING.PLAN_NAMES.PROFESSIONAL && <span className="recommended-tag">RECOMMENDED</span>}
              </Space>
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
