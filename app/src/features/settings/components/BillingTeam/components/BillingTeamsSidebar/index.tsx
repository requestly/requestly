import { Col, Row } from "antd";
import { MdOutlineGroup } from "@react-icons/all-files/md/MdOutlineGroup";
import { NavLink } from "react-router-dom";

export const BillingTeamsSidebar = () => {
  return (
    <>
      <Col className="title">Billing</Col>
      <Row align="middle" className="mt-16 settings-secondary-sidebar-section-title" gutter={8}>
        <MdOutlineGroup />
        <Col style={{ marginLeft: "4px" }}>My billing teams</Col>
      </Row>

      {/* MAP TEAMS HERE */}
      <Col className="settings-secondary-sidebar-section">
        <NavLink
          to="/settings/billing/1"
          className={({ isActive }) =>
            `settings-secondary-sidebar-section-link ${
              isActive ? "settings-secondary-sidebar-section-active-link" : ""
            }`
          }
        >
          RQ official
        </NavLink>
        <NavLink
          to="/settings/billing/2"
          className={({ isActive }) =>
            `settings-secondary-sidebar-section-link ${
              isActive ? "settings-secondary-sidebar-section-active-link" : ""
            }`
          }
        >
          RQ official 2
        </NavLink>
      </Col>
    </>
  );
};
