import { useMemo } from "react";
import { matchPath, PathMatch, useLocation } from "react-router-dom";
import { tabRoutes, TabSource } from "../routes";

export const useMatchedTabSource = (): {
  tabSource: TabSource;
  matchedPath: PathMatch<string>;
} | null => {
  const location = useLocation();

  const matchedRoute = useMemo(() => {
    for (const route of tabRoutes) {
      const matchedPath = matchPath(route.path, location.pathname);
      if (matchedPath) {
        return { matchedPath, tabSource: route.tabSource };
      }
    }
  }, [location.pathname]);

  return matchedRoute;
};
