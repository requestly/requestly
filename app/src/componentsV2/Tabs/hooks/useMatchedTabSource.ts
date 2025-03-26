import { useMemo } from "react";
import { matchPath, PathMatch } from "react-router-dom";
import { tabRoutes } from "../routes";
import { TabSourceFactory } from "../types";

export const useMatchedTabSource = (): {
  sourceFactory: TabSourceFactory;
  matchedPath: PathMatch<string>;
} | null => {
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
