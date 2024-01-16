import React from "react";
import { Col, Row } from "antd";
import { RQButton } from "lib/design-system/components";
import { MdOutlineCancel } from "@react-icons/all-files/md/MdOutlineCancel";
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
      PLAN DETAILS HERE
    </Col>
  );
};
