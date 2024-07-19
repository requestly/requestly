import { useLocation } from "react-router-dom";
import PATHS from "config/constants/sub/paths";

export const useIsRedirectFromCreateRulesRoute = () => {
  const location = useLocation();
  return location.state?.from === PATHS.RULES.CREATE;
};
