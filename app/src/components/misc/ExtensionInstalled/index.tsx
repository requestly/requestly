import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { trackExtensionInstalled } from "modules/analytics/events/misc/installation";
import { getAppMode, getExtensionInsallSource } from "store/selectors";
import { initImplicitTestRuleWidgetConfig } from "components/features/rules/TestThisRule";

const ExtensionInstalled: React.FC = () => {
  const installSourcePage = useSelector(getExtensionInsallSource);
  const appMode = useSelector(getAppMode);

  useEffect(() => {
    initImplicitTestRuleWidgetConfig(appMode);
  }, [appMode]);

  useEffect(() => {
    trackExtensionInstalled();
  }, []);

  return <Navigate to={installSourcePage ?? "/"} />;
};

export default ExtensionInstalled;
