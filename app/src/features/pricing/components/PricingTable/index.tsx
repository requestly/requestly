import React, { RefObject, useState } from "react";
import { Col, Row, Space, Tooltip, Typography } from "antd";
import { PricingFeatures } from "../../constants/pricingFeatures";
import { PricingPlans } from "../../constants/pricingPlans";
import { PRICING } from "../../constants/pricing";
import ContactUsModal from "components/landing/contactUsModal";
import { capitalize } from "lodash";
import underlineIcon from "../../assets/yellow-highlight.svg";
import checkIcon from "assets/img/icons/common/check.svg";
import { CloseOutlined } from "@ant-design/icons";
import TEAM_WORKSPACES from "config/constants/sub/team-workspaces";
import "./index.scss";
import { PricingTableButtons } from "./PricingTableButtons";

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
  const [isContactUsModalOpen, setIsContactUsModalOpen] = useState(false);

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
              <Row className="mt-16">
                <PricingTableButtons
                  key={planName + duration + workspaceToUpgrade?.id}
                  columnPlanName={planName}
                  selectedWorkspace={workspaceToUpgrade}
                  product={product}
                  duration={duration}
                  source={source}
                  setIsContactUsModalOpen={setIsContactUsModalOpen}
                />
              </Row>
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
