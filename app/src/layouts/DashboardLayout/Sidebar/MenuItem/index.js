import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import APP_CONSTANTS from "config/constants";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import {
  AddUser,
  Bag2,
  Category,
  Delete,
  Document,
  Filter,
  PaperUpload,
  Swap,
  Video,
  Play,
} from "react-iconly";
import { getAppMode, getAppTheme, getUserAuthDetails } from "store/selectors";
import { Divider, Menu } from "antd";
import { useLocation, Link } from "react-router-dom";
import { MobileOutlined } from "@ant-design/icons";
import { trackTutorialsClicked } from "modules/analytics/events/misc/tutorials";
import { isUserUsingAndroidDebugger } from "components/features/mobileDebugger/utils/sdkUtils";
import { trackSidebarClicked } from "modules/analytics/events/common/onboarding/sidebar";
import { snakeCase } from "lodash";

const { SubMenu } = Menu;

const { PATHS, LINKS } = APP_CONSTANTS;

const givenRoutes = [
  {
    header: "Rules",
    key: "header-rules",
  },
  {
    path: PATHS.RULES.MY_RULES.ABSOLUTE,
    name: "HTTP Rules",
    icon: <Filter set="curved" className="remix-icon" />,
    key: "my-http-rules",
  },
  {
    path: PATHS.RULES.TEMPLATES.ABSOLUTE,
    name: "Templates",
    icon: <Bag2 set="curved" className="remix-icon" />,
    key: "template-rules",
  },
  {
    path: PATHS.SHARED_LISTS.MY_LISTS.ABSOLUTE,
    name: "Shared Lists",
    icon: <AddUser set="curved" className="remix-icon" />,
    key: "shared-lists",
  },
  {
    path: PATHS.TRASH.ABSOLUTE,
    name: "Trash",
    icon: <Delete set="curved" className="remix-icon" />,
    key: "rules-trash",
  },
  {
    header: "Mocks",
    key: "mocks",
  },
  {
    // path: PATHS.MOCK_SERVER.MY_MOCKS.ABSOLUTE,
    path: PATHS.MOCK_SERVER_V2.ABSOLUTE,
    name: "Mock Server",
    icon: <Document set="curved" className="remix-icon" />,
    key: "my-mocks",
  },
  {
    // path: PATHS.FILES.MY_FILES.ABSOLUTE,
    path: PATHS.FILE_SERVER_V2.ABSOLUTE,
    name: "File Server",
    icon: <PaperUpload set="curved" className="remix-icon" />,
    key: "my-mock-files",
  },
  {
    header: "Others",
    key: "others",
  },
  {
    path: PATHS.SESSIONS.RELATIVE,
    name: "Session Recording",
    icon: <Video set="curved" className="remix-icon" />,
    key: "session-recordings",
  },
  {
    path: LINKS.YOUTUBE_TUTORIALS,
    name: <span>Tutorials</span>,
    icon: <Play set="curved" className="remix-icon" />,
    key: "tutorials",
  },
];

const MenuItem = (props) => {
  const { onClose, collapsed } = props;

  const [collapsedFlag, setCollapsedFlag] = useState(false);
  // Location
  const location = useLocation();
  const { pathname } = location;

  // Global State
  const appMode = useSelector(getAppMode);
  const appTheme = useSelector(getAppTheme);
  const user = useSelector(getUserAuthDetails);

  // Component State
  const [myRoutes, setMyRoutes] = useState(givenRoutes);

  const splitLocation = pathname.split("/");

  // Menu
  const locationURL = pathname;

  // Set desktop app routes
  useEffect(() => {
    // For Desktop App - Show Sources menu in Navbar only in  Desktop App
    if (appMode && appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP) {
      const allRoutes = [...myRoutes];
      // Check if doesn't exist already!
      if (allRoutes.some((route) => route.key === "my-apps")) return;
      allRoutes.unshift({
        path: PATHS.DESKTOP.MY_APPS.ABSOLUTE,
        key: "my-apps",
        name: "Connected Apps",
        icon: <Category set="curved" className="remix-icon" />,
      });
      allRoutes.unshift({
        path: PATHS.DESKTOP.INTERCEPT_TRAFFIC.ABSOLUTE,
        key: "network-traffic",
        name: "Network Traffic",
        icon: <Swap set="curved" className="remix-icon" />,
      });
      setMyRoutes(allRoutes);
    }
  }, [appMode, myRoutes]);

  useEffect(() => {
    isUserUsingAndroidDebugger(user?.details?.profile?.uid).then((result) => {
      if (result) {
        const allRoutes = [...myRoutes];
        const index = allRoutes.findIndex(
          (route) => route.key === "session-recordings"
        );
        allRoutes.splice(index, 0, {
          path: PATHS.MOBILE_DEBUGGER.RELATIVE,
          name: "Mobile Debugger",
          icon: <MobileOutlined />,
          key: "mobile-debugger",
        });
        setMyRoutes(allRoutes);
      } else {
        setMyRoutes((prev) =>
          prev.filter((route) => route.key !== "mobile-debugger")
        );
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.loggedIn]);

  useEffect(() => {
    if (collapsed) {
      setTimeout(() => {
        setCollapsedFlag(collapsed); // on collapse, we align the text to center so do not want to do it immediately which induces a jerking motion of sidebar
      }, 300);
    } else {
      setCollapsedFlag(collapsed);
    }
  }, [collapsed]);

  const menuItem = myRoutes.map((item) => {
    if (item.header) {
      return (
        <>
          {item.key === "others" ? (
            <Divider className="sidebar-horizontal-divider" />
          ) : null}
          <Menu.ItemGroup key={item.key} title={item.header}></Menu.ItemGroup>
        </>
      );
    }

    if (item.children) {
      return (
        <SubMenu key={item.key} icon={item.icon} title={item.name}>
          {item.children.map((child) => {
            if (!child.children) {
              const childrenNavLink = child.path;

              return (
                // Level 2
                <Menu.Item
                  key={child.key}
                  icon={<div className="icon-wrapper">{child.icon}</div>}
                  className={
                    locationURL === childrenNavLink
                      ? "ant-menu-item-selected"
                      : "ant-menu-item-selected-in-active"
                  }
                  onClick={onClose}
                >
                  <Link to={child.path}>{child.name}</Link>
                </Menu.Item>
              );
            } else {
              return (
                // Level 3
                <SubMenu key={child.key} title={child.name}>
                  {child.children.map((childItem) => {
                    const childrenItemLink = childItem.path;

                    return (
                      <Menu.Item
                        key={childItem.key}
                        className={
                          locationURL === childrenItemLink
                            ? "ant-menu-item-selected"
                            : "ant-menu-item-selected-in-active"
                        }
                        onClick={onClose}
                      >
                        <Link to={childItem.path}>{childItem.name}</Link>
                      </Menu.Item>
                    );
                  })}
                </SubMenu>
              );
            }
          })}
        </SubMenu>
      );
    } else {
      const itemNavLink = item.path;

      return (
        // Level 1 (in use)
        <Menu.Item
          key={item.key}
          icon={<div className="icon-wrapper">{item.icon}</div>}
          onClick={onClose}
          style={{ paddingLeft: "11px", paddingRight: "6px" }}
          className={
            locationURL === itemNavLink
              ? "ant-menu-item-selected"
              : "ant-menu-item-selected-in-active"
          }
        >
          {}
          {item.path === LINKS.YOUTUBE_TUTORIALS ? (
            <a
              href={LINKS.YOUTUBE_TUTORIALS}
              target="_blank"
              rel="noreferrer"
              onClick={trackTutorialsClicked}
            >
              {item.name}
            </a>
          ) : (
            <Link
              onClick={() => trackSidebarClicked(snakeCase(item.name))}
              to={item.path}
            >
              {item.name}
            </Link>
          )}
        </Menu.Item>
      );
    }
  });

  return (
    <Menu
      mode="inline"
      selectedKeys={[]}
      defaultOpenKeys={[
        splitLocation.length === 5
          ? splitLocation[splitLocation.length - 3]
          : null,
        splitLocation[splitLocation.length - 2],
      ]}
      theme={appTheme}
      style={{
        paddingBottom: "2.4rem",
      }}
      className={`siderbar-menu
      ${collapsedFlag ? " siderbar-menu-collapsed" : ""}`}
    >
      {menuItem}
    </Menu>
  );
};

export default MenuItem;
