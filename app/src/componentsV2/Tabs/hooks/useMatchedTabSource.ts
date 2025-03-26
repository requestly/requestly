import { useMemo } from "react";
import { matchPath, PathMatch, useLocation } from "react-router-dom";
import { tabRoutes, TabSource } from "../routes";

// TODO: move into utils
export const getIdFromPath = (url: string): string | null => {
  try {
    const segments = new URL(url).pathname.split("/");
    console.log({ url, segments });

    return segments[segments.length - 1] || null;
  } catch {
    throw new Error("Invalid URL!");
  }
};

export const useMatchedTabSource = (): {
  tabSource: TabSource;
  entityId: string;
  matchedPath: PathMatch<string>;
} | null => {
  const location = useLocation();

  const matchedRoute = useMemo(() => {
    for (const route of tabRoutes) {
      const matchedPath = matchPath(route.path, location.pathname);
      if (matchedPath) {
        const entityId = getIdFromPath(window.location.href);
        return { matchedPath, tabSource: route.tabSource, entityId };
      }
    }
  }, [location.pathname]);

  return matchedRoute;
};
