import React, { useMemo } from "react";
import { Col, Row } from "antd";
import { MdOutlineGroup } from "@react-icons/all-files/md/MdOutlineGroup";
import { MdGroups } from "@react-icons/all-files/md/MdGroups";
import { NavLink, useNavigate } from "react-router-dom";
import { trackBillingTeamNavigated } from "features/settings/analytics";
import { BillingTeamDetails } from "../../types";
import { useSelector } from "react-redux";
import { getUserAuthDetails } from "store/selectors";
import APP_CONSTANTS from "config/constants";
import { PRICING } from "features/pricing";

export const BillingTeamsSidebar: React.FC<{ billingTeams: BillingTeamDetails[] }> = ({ billingTeams }) => {
  const navigate = useNavigate();
  const user = useSelector(getUserAuthDetails);

  const groupedTeams = useMemo(() => {
    return billingTeams.reduce(
      (acc, team) => {
        if (user?.details?.profile?.uid in team.members) {
          acc.myTeams.push(team);
        } else {
          acc.otherTeams.push(team);
        }
        return acc;
      },
      { myTeams: [], otherTeams: [] }
    );
  }, [user?.details?.profile?.uid, billingTeams]);

  return (
    <>
      <Col className="title">Billing</Col>
      <Row align="middle" className="mt-16 settings-secondary-sidebar-section-title" gutter={8}>
        <MdOutlineGroup />
        <Col style={{ marginLeft: "4px" }}>My billing</Col>
      </Row>

      <Col className="settings-secondary-sidebar-section">
        {groupedTeams.myTeams.length ? (
          <>
            {groupedTeams.myTeams.map((billingTeam) => (
              <NavLink
                key={billingTeam.id}
                onClick={() => trackBillingTeamNavigated("my_team")}
                to={APP_CONSTANTS.PATHS.SETTINGS.BILLING.RELATIVE + `/${billingTeam.id}`}
                className={({ isActive }) =>
                  `settings-secondary-sidebar-section-link ${
                    isActive ? "settings-secondary-sidebar-section-active-link" : ""
                  }`
                }
              >
                {billingTeam.name}
              </NavLink>
            ))}
          </>
        ) : null}
        {!groupedTeams.myTeams.length ||
        (user?.details?.planDetails?.type === PRICING.CHECKOUT.MODES.INDIVIDUAL &&
          ["active", "trialing"].includes(user?.details?.planDetails?.status)) ? (
          <div
            className="settings-secondary-sidebar-section-link"
            style={{
              backgroundColor:
                window.location.pathname === APP_CONSTANTS.PATHS.SETTINGS.BILLING.RELATIVE ? "var(--surface-2)" : "",
            }}
            onClick={() => navigate(APP_CONSTANTS.PATHS.SETTINGS.BILLING.RELATIVE)}
          >
            Plan details
          </div>
        ) : null}
      </Col>

      {groupedTeams.otherTeams.length > 0 && (
        <>
          <Row align="middle" className="mt-16 settings-secondary-sidebar-section-title" gutter={8}>
            <MdGroups />
            <Col style={{ marginLeft: "4px" }}>Other billing teams</Col>
          </Row>

          <Col className="settings-secondary-sidebar-section">
            {groupedTeams.otherTeams.map((billingTeam) => (
              <NavLink
                key={billingTeam.id}
                onClick={() => trackBillingTeamNavigated("my_team")}
                to={APP_CONSTANTS.PATHS.SETTINGS.BILLING.RELATIVE + `/${billingTeam.id}`}
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
      )}
    </>
  );
};
