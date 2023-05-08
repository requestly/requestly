import React, { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import APP_CONSTANTS from "config/constants";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import { AddUser, Bag2, Delete, Document, Filter, PaperUpload, Swap, Video, Play, People } from "react-iconly";
import { getAppMode, getAppTheme, getNetworkSessionSaveInProgress, getUserAuthDetails } from "store/selectors";
import { Menu, Tooltip } from "antd";
import { useLocation, Link } from "react-router-dom";
import { MobileOutlined } from "@ant-design/icons";
import { trackTutorialsClicked } from "modules/analytics/events/misc/tutorials";
import { isUserUsingAndroidDebugger } from "components/features/mobileDebugger/utils/sdkUtils";
import { trackSidebarClicked } from "modules/analytics/events/common/onboarding/sidebar";
import { snakeCase } from "lodash";

const { PATHS, LINKS } = APP_CONSTANTS;

const MenuItem = (props) => {
  const { onClose, collapsed } = props;

  // Location
  const location = useLocation();
  const { pathname } = location;

  // Global State
  const appMode = useSelector(getAppMode);
  const appTheme = useSelector(getAppTheme);
  const user = useSelector(getUserAuthDetails);
  const isSavingNetworkSession = useSelector(getNetworkSessionSaveInProgress);

  const givenRoutes = useCallback(() => {
    const routes = [
      {
        header: "Product",
        key: "header-product",
      },
      {
        path: PATHS.RULES.MY_RULES.ABSOLUTE,
        name: "HTTP Rules",
        icon: <Filter set="curved" className="remix-icon" />,
        key: "my-http-rules",
      },
      {
        path: PATHS.SESSIONS.RELATIVE,
        name: "Sessions",
        icon: (
          <Tooltip title={"View and manage your saved sessions here"} placement="right" open={isSavingNetworkSession}>
            <Video set="curved" className="remix-icon" />
          </Tooltip>
        ),
        key: "sessions",
      },
      {
        path: PATHS.MOCK_SERVER_V2.ABSOLUTE,
        name: "Mock Server",
        icon: <Document set="curved" className="remix-icon" />,
        key: "my-mocks",
      },
      {
        path: PATHS.FILE_SERVER_V2.ABSOLUTE,
        name: "File Server",
        icon: <PaperUpload set="curved" className="remix-icon" />,
        key: "my-mock-files",
      },
      {
        header: "Collaboration",
        collapsedHeader: "Collab",
        key: "header-collaboration",
      },
      {
        path: PATHS.SHARED_LISTS.MY_LISTS.ABSOLUTE,
        name: "Shared Lists",
        icon: <AddUser set="curved" className="remix-icon" />,
        key: "shared-lists",
      },
      {
        path: PATHS.ACCOUNT.MY_TEAMS.RELATIVE,
        name: "Workspaces",
        icon: <People set="curved" className="remix-icon" />,
        key: "workspaces",
      },
      {
        header: "divider",
        key: "divider",
      },
      {
        header: "Others",
        key: "others",
      },
      {
        path: PATHS.RULES.TEMPLATES.ABSOLUTE,
        name: "Templates",
        icon: <Bag2 set="curved" className="remix-icon" />,
        key: "template-rules",
      },
      {
        path: PATHS.TRASH.ABSOLUTE,
        name: "Trash",
        icon: <Delete set="curved" className="remix-icon" />,
        key: "rules-trash",
      },
      {
        path: LINKS.YOUTUBE_TUTORIALS,
        name: <span>Tutorials</span>,
        icon: <Play set="curved" className="remix-icon" />,
        key: "tutorials",
      },
    ];

    if (appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP) {
      if (routes.some((route) => route.key === "network-traffic")) return;
      routes.unshift({
        path: PATHS.DESKTOP.INTERCEPT_TRAFFIC.ABSOLUTE,
        key: "network-traffic",
        name: "Network Traffic",
        icon: <Swap set="curved" className="remix-icon" />,
      });
    }
    return routes;
  }, [appMode, isSavingNetworkSession]);

  // Component State
  const [myRoutes, setMyRoutes] = useState(givenRoutes());

  const splitLocation = pathname.split("/");

  // Menu
  const locationURL = pathname;

  useEffect(() => {
    setMyRoutes(givenRoutes());
  }, [givenRoutes]);

  useEffect(() => {
    isUserUsingAndroidDebugger(user?.details?.profile?.uid).then((result) => {
      if (result) {
        const allRoutes = [...myRoutes];
        const index = allRoutes.findIndex((route) => route.key === "header-collaboration");
        allRoutes.splice(index, 0, {
          path: PATHS.MOBILE_DEBUGGER.RELATIVE,
          name: "Android Debugger",
          icon: <MobileOutlined />,
          key: "android-debugger",
        });
        setMyRoutes(allRoutes);
      } else {
        setMyRoutes((prev) => prev.filter((route) => route.key !== "android-debugger"));
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.loggedIn]);

  const menuItems = myRoutes.map((item) => {
    if (item.header) {
      if (item.key === "divider") {
        return {
          type: "divider",
          key: item.key,
          className: "sidebar-horizontal-divider",
        };
      }
      return {
        type: "group",
        label: (collapsed && item.collapsedHeader) || item.header,
        key: item.key,
      };
    }
    return {
      key: item.key,
      icon: <div className="icon-wrapper">{item.icon}</div>,
      onClick: onClose,
      style: { paddingLeft: "11px", paddingRight: "6px" },
      className: locationURL === item.path ? "ant-menu-item-selected" : "ant-menu-item-selected-in-active",
      label:
        item.path === LINKS.YOUTUBE_TUTORIALS ? (
          <a href={LINKS.YOUTUBE_TUTORIALS} target="_blank" rel="noreferrer" onClick={trackTutorialsClicked}>
            {item.name}
          </a>
        ) : (
          <Link onClick={() => trackSidebarClicked(snakeCase(item.name))} to={item.path}>
            {item.name}
          </Link>
        ),
    };
  });

  return (
    <Menu
      mode="inline"
      selectedKeys={[]}
      defaultOpenKeys={[
        splitLocation.length === 5 ? splitLocation[splitLocation.length - 3] : null,
        splitLocation[splitLocation.length - 2],
      ]}
      theme={appTheme}
      style={{
        paddingBottom: "2.4rem",
      }}
      className={`siderbar-menu`}
      items={menuItems}
    />
  );
};

export default MenuItem;
