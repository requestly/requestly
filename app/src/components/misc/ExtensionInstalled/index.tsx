import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { trackExtensionInstalled } from "modules/analytics/events/misc/installation";
import PATHS from "config/constants/sub/paths";

const ExtensionInstalled: React.FC = () => {
  useEffect(() => {
    trackExtensionInstalled();
  }, []);

  return <Navigate to={PATHS.RULES.MY_RULES.ABSOLUTE} />;
};

export default ExtensionInstalled;
