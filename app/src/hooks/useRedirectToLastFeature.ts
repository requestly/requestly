import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { getLastFeaturePath } from "store/selectors";
import { globalActions } from "store/slices/global/slice";
import PATHS from "config/constants/sub/paths";

const useRedirectToLastFeature = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const storedFeaturePath = useSelector(getLastFeaturePath);

  const LAST_KNOWN_PATHS = new Set([
    PATHS.API_CLIENT.INDEX,
    PATHS.RULES.INDEX,
    PATHS.MOCK_SERVER.INDEX,
    PATHS.NETWORK_INSPECTOR.INDEX,
    `/${PATHS.SESSIONS.INDEX}`,
    PATHS.HOME.RELATIVE,
    PATHS.DESKTOP.INTERCEPT_TRAFFIC.RELATIVE,
  ]);

  useEffect(() => {
    if (location.pathname === "/" && storedFeaturePath && storedFeaturePath !== "/") {
      navigate(storedFeaturePath, { replace: true });
    }
  }, [storedFeaturePath, location.pathname, navigate]);

  useEffect(() => {
    const pathSegments = location.pathname.split("/")?.filter(Boolean);
    let featurePath = `/${pathSegments[0]}`;

    if (pathSegments[0] === "desktop" && pathSegments.length > 1) {
      featurePath += `/${pathSegments[1]}`;
    }
    if (LAST_KNOWN_PATHS.has(featurePath)) {
      dispatch(globalActions.updateLastFeaturePath(featurePath));
    }
  }, [dispatch, location.pathname]);
};

export default useRedirectToLastFeature;
