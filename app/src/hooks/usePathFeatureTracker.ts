import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { getLastVisitedPath } from "store/selectors";
import { globalActions } from "store/slices/global/slice";

const usePathFeatureTracker = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const lastFeaturePath = useSelector(getLastVisitedPath);

  useEffect(() => {
    if (location.pathname === "/" && lastFeaturePath && lastFeaturePath !== "/") {
      navigate(lastFeaturePath, { replace: true });
    }
  }, [lastFeaturePath, location.pathname, navigate]);

  useEffect(() => {
    const featurePath = "/" + location.pathname.split("/")[1];
    dispatch(globalActions.updateLastVisitedPath(featurePath));
  }, [dispatch, location.pathname]);
};

export default usePathFeatureTracker;
