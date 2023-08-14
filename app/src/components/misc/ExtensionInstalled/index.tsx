import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { trackExtensionInstalled } from "modules/analytics/events/misc/installation";
import { getExtensionInsallSource } from "store/selectors";

const ExtensionInstalled: React.FC = () => {
  const installSourcePage = useSelector(getExtensionInsallSource);
  useEffect(() => {
    trackExtensionInstalled();
  }, []);

  return <Navigate to={installSourcePage ?? "/"} />;
};

export default ExtensionInstalled;
