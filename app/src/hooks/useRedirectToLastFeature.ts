import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import { globalActions } from "store/slices/global/slice";
import PATHS from "config/constants/sub/paths";

const useRedirectToLastFeature = () => {
  const dispatch = useDispatch();
  const location = useLocation();

  const LAST_KNOWN_PATHS = new Set([
    PATHS.API_CLIENT.INDEX,
    PATHS.RULES.INDEX,
    PATHS.MOCK_SERVER.INDEX,
    PATHS.NETWORK_INSPECTOR.INDEX,
    `/${PATHS.SESSIONS.INDEX}`,
  ]);

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

export default useRedirectToLastFeature;
