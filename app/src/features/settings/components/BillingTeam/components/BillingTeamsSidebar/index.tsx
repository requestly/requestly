import React from "react";
import { Col, Row } from "antd";
import { MdOutlineGroup } from "@react-icons/all-files/md/MdOutlineGroup";
import { NavLink } from "react-router-dom";

export const BillingTeamsSidebar: React.FC<{ billingTeams: { id: string; name: string }[] }> = ({ billingTeams }) => {
  return (
    <>
      <Col className="title">Billing</Col>
      <Row align="middle" className="mt-16 settings-secondary-sidebar-section-title" gutter={8}>
        <MdOutlineGroup />
        <Col style={{ marginLeft: "4px" }}>My billing teams</Col>
      </Row>

      <Col className="settings-secondary-sidebar-section">
        {billingTeams.map((billingTeam) => (
          <NavLink
            key={billingTeam.id}
            to={`/settings/billing/${billingTeam.id}`}
            className={({ isActive }) =>
              `settings-secondary-sidebar-section-link ${
                isActive ? "settings-secondary-sidebar-section-active-link" : ""
              }`
            }
          >
            {billingTeam.name}
          </NavLink>
        ))}
      </Col>
    </>
  );
};
