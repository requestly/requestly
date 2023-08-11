import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { trackExtensionInstalled } from "modules/analytics/events/misc/installation";
import PATHS from "config/constants/sub/paths";

const ExtensionInstalled: React.FC = () => {
  const navigateToPage = window.localStorage.getItem("extension_install_source");

  useEffect(() => {
    trackExtensionInstalled();
  }, []);

  return <Navigate to={navigateToPage ?? PATHS.RULES.MY_RULES.ABSOLUTE} />;
};

export default ExtensionInstalled;
