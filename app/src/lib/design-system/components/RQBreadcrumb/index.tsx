import React, { useCallback } from "react";
import { Breadcrumb, BreadcrumbProps } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { capitalize } from "lodash";
import "./RQBreadcrumb.css";

export const RQBreadcrumb: React.FC<BreadcrumbProps> = (props) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const getPathLabel = useCallback((path: string): string => {
    if (path === "filesv2") {
      return "Files";
    }

    if (path === "api-client") {
      return "API Client";
    }

    // TODO: rather derive from the list used in Sidebar
    return capitalize(path.includes("-") ? path.split("-").join(" ") : path);
  }, []);

  const getBreadcrumb = useCallback(
    (pathname: string) => {
      return pathname.split("/").slice(1).map(getPathLabel).slice(0, 2); // limiting the nesting because of some nested routes
      // which does not exist and on clicking over them will navigate to 404 page
      // e.g sessions/saved/:id clicking on "saved" will take to 404 page
    },
    [getPathLabel]
  );

  const breadcrumbData = getBreadcrumb(pathname);

  const checkIfLastRoute = (index: number) => index === breadcrumbData.length - 1;

  const handleRouteClick = (index: number) => {
    if (checkIfLastRoute(index)) {
      return;
    }
    let selectedRoute = `/${breadcrumbData.slice(0, index + 1).join("/")}`;
    if (selectedRoute.includes("Files")) {
      selectedRoute = "/filesv2";
    }
    if (selectedRoute.includes(" ")) {
      selectedRoute = selectedRoute.split(" ").join("-").toLowerCase();
    }
    navigate(selectedRoute);
  };

  return (
    <Breadcrumb {...props} className={`rq-breadcrumb ${props?.className ?? ""}`}>
      {breadcrumbData.map((item, index: number) => (
        <Breadcrumb.Item key={index} className="rq-breadcrumb-item" onClick={() => handleRouteClick(index)}>
          {item}
        </Breadcrumb.Item>
      ))}
    </Breadcrumb>
  );
};
