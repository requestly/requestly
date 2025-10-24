import React from "react";
import { useSelector } from "react-redux";
import { getBillingTeamMemberById } from "store/features/billing/selectors";
import { Col, Space } from "antd";
import { IoMdClose } from "@react-icons/all-files/io/IoMdClose";
import { BillingTeamDetails } from "features/settings/components/BillingTeam/types";
import "./index.scss";

interface Props {
  teamDetails: BillingTeamDetails;
  closePopover: () => void;
}

export const TeamDetailsPopover: React.FC<Props> = ({ teamDetails, closePopover }) => {
  const teamOwnerDetails = useSelector(getBillingTeamMemberById(teamDetails.id, teamDetails.owner));
  return (
    <div className="team-details-popover-content">
      <IoMdClose className="team-details-popover-close-icon" onClick={closePopover} />
      <Space direction="vertical" size={8}>
        <Col>
          <div className="team-details-label">Billing manager</div>
          <div className="text-white">{teamOwnerDetails?.displayName}</div>
        </Col>
        <Col>
          <div className="team-details-label">Email</div>
          <div className="text-white">{teamOwnerDetails?.email}</div>
        </Col>
      </Space>
    </div>
  );
};
