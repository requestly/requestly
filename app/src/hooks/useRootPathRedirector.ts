import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { globalActions } from "store/slices/global/slice";
import PATHS from "config/constants/sub/paths";
import { getAppMode, getLastUsedFeaturePath } from "store/selectors";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import { useIsAuthSkipped } from "./useIsAuthSkipped";

const useRootPathRedirector = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const storedFeaturePath = useSelector(getLastUsedFeaturePath);
  const appMode = useSelector(getAppMode);
  const isAuthSkipped = useIsAuthSkipped();
  const [searchParams] = useSearchParams();
  const params = useMemo(() => {
    const searchParamsCopy = new URLSearchParams(searchParams);
    // Seems redundant. But not removed right now not to break anything
    if (isAuthSkipped) {
      searchParamsCopy.set("skip_auth", "true");
    }
    return searchParamsCopy;
  }, [searchParams, isAuthSkipped]);

  const LAST_KNOWN_PATHS = new Set([
    PATHS.API_CLIENT.INDEX,
    PATHS.RULES.INDEX,
    PATHS.MOCK_SERVER.INDEX,
    PATHS.NETWORK_INSPECTOR.INDEX,
    `/${PATHS.SESSIONS.INDEX}`,
  ]);

  const isOpenedInDesktopMode = PATHS.ROOT === location.pathname && appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP;

  useEffect(() => {
    if (location.pathname === PATHS.ROOT) {
      if (storedFeaturePath && storedFeaturePath !== PATHS.ROOT) {
        navigate(`${storedFeaturePath}?${params}`, { replace: true });
      } else {
        isOpenedInDesktopMode
          ? navigate(PATHS.DESKTOP.INTERCEPT_TRAFFIC.ABSOLUTE, { replace: true })
          : navigate(`${PATHS.HOME.ABSOLUTE}?${params}`, { replace: true });
      }
    }
  }, [isOpenedInDesktopMode, location.pathname, navigate, storedFeaturePath, params]);

  useEffect(() => {
    const pathSegments = location.pathname.split("/")?.filter(Boolean);
    let featurePath = `/${pathSegments[0]}`;

    if (pathSegments[0] === "desktop" && pathSegments.length > 1) {
      featurePath += `/${pathSegments[1]}`;
    }

    if (featurePath === PATHS.HOME.RELATIVE || featurePath === PATHS.DESKTOP.INTERCEPT_TRAFFIC.RELATIVE) {
      dispatch(globalActions.updateLastUsedFeaturePath(PATHS.ROOT));
    } else if (LAST_KNOWN_PATHS.has(featurePath)) {
      dispatch(globalActions.updateLastUsedFeaturePath(featurePath));
    }
  }, [dispatch, location.pathname]);
};

export default useRootPathRedirector;
