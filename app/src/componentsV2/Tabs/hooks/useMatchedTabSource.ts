import { useMemo } from "react";
import { matchPath } from "react-router-dom";
import { tabRoutes } from "../routes";

export const useMatchedTabSource = () => {
  const matchedRoute = useMemo(() => {
    for (const route of tabRoutes) {
      const matchedPath = matchPath(route.path, window.location.pathname);
      if (matchedPath) {
        return { matchedPath, sourceFactory: route.tabSourceFactory };
      }
    }
  }, []);

  return matchedRoute;
};
