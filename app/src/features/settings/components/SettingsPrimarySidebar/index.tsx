import React, { useMemo, useRef } from "react";
import { useSelector } from "react-redux";
import { getAppMode, getUserAttributes } from "store/selectors";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { Col, Row } from "antd";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { MdOutlineDisplaySettings } from "@react-icons/all-files/md/MdOutlineDisplaySettings";
import { RiBuildingLine } from "@react-icons/all-files/ri/RiBuildingLine";
import { IoMdArrowBack } from "@react-icons/all-files/io/IoMdArrowBack";
import { MdOutlineAccountBox } from "@react-icons/all-files/md/MdOutlineAccountBox";
import { redirectToTraffic } from "utils/RedirectionUtils";
import APP_CONSTANTS from "config/constants";
//@ts-ignore
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import { trackAppSettingsSidebarClicked } from "features/settings/analytics";
import "./index.scss";
import { isCompanyEmail } from "utils/mailCheckerUtils";
import { getAvailableBillingTeams } from "store/features/billing/selectors";

const { PATHS } = APP_CONSTANTS;

export const SettingsPrimarySidebar: React.FC = () => {
  const user = useSelector(getUserAuthDetails);
  const appMode = useSelector(getAppMode);
  const userAttributes = useSelector(getUserAttributes);
  const billingTeams = useSelector(getAvailableBillingTeams);
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = location;

  const redirectUrl = useRef(state?.redirectUrl ?? null);

  const sidebarItems = useMemo(
    () => [
      {
        id: "my_accounts",
        name: "Accounts",
        icon: <MdOutlineAccountBox />,
        children: [
          {
            id: "profile",
            name: "Profile",
            path: PATHS.SETTINGS.PROFILE.RELATIVE,
          },
        ],
      },
      {
        id: "app_settings",
        name: "App",
        icon: <MdOutlineDisplaySettings />,
        children: [
          {
            id: "global",
            name: "Global settings",
            path: PATHS.SETTINGS.GLOBAL_SETTINGS.RELATIVE,
          },
          {
            id: "desktop",
            name: "Desktop settings",
            path: PATHS.SETTINGS.DESKTOP_SETTINGS.RELATIVE,
            ishidden: appMode !== GLOBAL_CONSTANTS.APP_MODES.DESKTOP,
          },
          {
            id: "secrets",
            name: "Secrets",
            path: PATHS.SETTINGS.SECRETS.RELATIVE,
            ishidden: appMode !== GLOBAL_CONSTANTS.APP_MODES.DESKTOP,
          },
          {
            id: "sessionBook",
            name: "SessionBook",
            path: PATHS.SETTINGS.SESSION_BOOK.RELATIVE,
            ishidden: appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP,
          },
        ],
      },
      {
        id: "org_settings",
        name: "My organization",
        icon: <RiBuildingLine />,
        children: [
          {
            id: "members",
            name: "Members",
            path: PATHS.SETTINGS.MEMBERS.RELATIVE,
            ishidden:
              !(user?.details?.profile?.isEmailVerified && isCompanyEmail(user.details?.emailType)) ||
              userAttributes?.browserstack_id,
          },
          {
            id: "workspaces",
            name: "Team workspaces",
            path: PATHS.SETTINGS.WORKSPACES.RELATIVE,
          },
          {
            id: "my-plan",
            name: "My plan",
            path: PATHS.SETTINGS.MY_PLAN.RELATIVE,
            ishidden: !user.loggedIn,
          },
          {
            id: "billing",
            name: "Billing",
            path: PATHS.SETTINGS.BILLING.RELATIVE,
            ishidden: !user.loggedIn || billingTeams?.length === 0,
          },
        ],
      },
    ],
    [
      appMode,
      user.details?.emailType,
      user.details?.profile?.isEmailVerified,
      user.loggedIn,
      userAttributes?.browserstack_id,
      billingTeams?.length,
    ]
  );

  return (
    <Col
      className={`settings-primary-sidebar ${appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP ? "app-mode-desktop" : ""}`}
    >
      <Row align="middle" gutter={6}>
        <Col>
          <IoMdArrowBack
            className="settings-primary-sidebar-title-icon"
            onClick={() => {
              if (redirectUrl.current) {
                navigate(redirectUrl.current);
                return;
              }
              if (appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP) redirectToTraffic(navigate);
              else navigate(APP_CONSTANTS.PATHS.HOME.ABSOLUTE);
            }}
          />
        </Col>
        <Col className="settings-primary-sidebar-title">Settings</Col>
      </Row>

      <Col className="mt-16">
        {sidebarItems.map((item) => {
          return (
            <Col key={item.id} className="settings-primary-sidebar-section">
              <Row className="settings-primary-sidebar-section-header" gutter={8} align="middle">
                <Col className="settings-primary-sidebar-section-header-icon">{item.icon}</Col>
                <Col className="settings-primary-sidebar-section-header-title">{item.name}</Col>
              </Row>
              <Col style={{ padding: "0 1rem" }}>
                {item.children.map((child) => {
                  if (child.ishidden) {
                    return null;
                  }
                  return (
                    <NavLink
                      to={child.path}
                      onClick={() => trackAppSettingsSidebarClicked(child.id)}
                      className={({ isActive }) =>
                        `settings-primary-sidebar-section-link ${
                          isActive ? "settings-primary-sidebar-section-active-link" : ""
                        }`
                      }
                    >
                      {child.name}
                    </NavLink>
                  );
                })}
              </Col>
            </Col>
          );
        })}
      </Col>
    </Col>
  );
};
