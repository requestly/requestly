import React from "react";
import { Col, Row } from "antd";
import { RQButton } from "lib/design-system/components";
import { MdOutlineCancel } from "@react-icons/all-files/md/MdOutlineCancel";
import { MdOutlinePreview } from "@react-icons/all-files/md/MdOutlinePreview";
import UpgradeIcon from "../../assets/upgrade.svg";
import { TeamPlanStatus } from "../TeamPlanStatus";
import "./index.scss";

export const TeamPlanDetails: React.FC = () => {
  return (
    <Col className="team-plan-details-card">
      <Row className="team-plan-details-card-header" justify="space-between" align="middle">
        <Col className="text-white text-bold display-flex items-center" style={{ gap: "8px" }}>
          Your Plan <TeamPlanStatus />
        </Col>
        <Col className="team-plan-details-card-actions">
          <RQButton type="text" className="team-plan-details-card-actions-cancel" icon={<MdOutlineCancel />}>
            Cancel plan
          </RQButton>
          <RQButton type="primary" icon={<img src={UpgradeIcon} alt="upgrade" />}>
            Upgrade plan
          </RQButton>
        </Col>
      </Row>
      <div className="team-plan-details-sections-wrapper">
        <div className="team-plan-details-section">
          <Row align="middle" gutter={8}>
            <Col className="team-plan-details-section-plan-name">Professional team plan</Col>
            <Col>
              {/* TODO: ADD POPOVER and show plan details in it based on team plan */}
              <RQButton size="small" type="text" icon={<MdOutlinePreview />} className="team-plan-details-btn">
                Plan details
              </RQButton>
            </Col>
          </Row>
          <Col
            className="mt-8"
            style={{
              color: "var(--neutrals-gray-300)",
            }}
          >
            Billed monthly
          </Col>
          <Row align="middle" gutter={4} className="mt-8">
            <Col className="header">7</Col>
            <Col className="text-white caption">Licences</Col>
          </Row>
        </div>
        <div className="team-plan-details-section">
          <Col className="team-plan-details-section__team-name">Core Engineering</Col>
          <div className="team-plan-details-section__team-details">
            <Col>
              <div className="team-plan-details-section-label">Billing manager</div>
              <div className="text-white">Parth Bhardwaj</div>
            </Col>
            <Col>
              <div className="team-plan-details-section-label">Email</div>
              <div className="text-white">test@gmail.com</div>
            </Col>
            <Col>
              <div className="team-plan-details-section-label">Description</div>
              <div className="text-white">Product team QA test</div>
            </Col>
          </div>
        </div>
        <div className="team-plan-details-section display-row-center items-center">
          <div>
            <Col className="text-center caption">Plan renewal date</Col>
            <Col className="mt-8 text-center text-bold header">Jan 11, 2024</Col>
          </div>
        </div>
      </div>
    </Col>
  );
};
