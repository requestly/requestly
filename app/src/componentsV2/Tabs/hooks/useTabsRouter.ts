import { useMemo } from "react";
import { matchPath, useLocation } from "react-router-dom";
import { tabRoutes } from "../routes";
import { useTabServiceWithSelector } from "../store/tabServiceStore";

export const useTabsRouter = () => {
  const location = useLocation();
  const [openTab] = useTabServiceWithSelector((state) => [state.openTab]);

  const matchedRoute = useMemo(() => {
    return tabRoutes.find((route) => {
      return !!matchPath(route.path, location.pathname);
    });
  }, [location.pathname]);

  if (!matchedRoute) {
    return;
  }

  // TODO: Call openTab
  // openTab();
};
