import { useNavigate } from "react-router-dom";
// UTILS
import { getAppMode } from "../../../../store/selectors";
import { redirectToRules, redirectToTraffic } from "../../../../utils/RedirectionUtils";
// CONSTANTS
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/constants";
import { useSelector } from "react-redux";

const MySources = () => {
  const navigate = useNavigate();

  const appMode = useSelector(getAppMode);

  if (appMode === GLOBAL_CONSTANTS.APP_MODES.EXTENSION) {
    redirectToRules(navigate);
  }

  redirectToTraffic(navigate);

  return null;
};

export default MySources;
