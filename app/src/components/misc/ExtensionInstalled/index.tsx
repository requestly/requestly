import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { trackExtensionInstalled } from "modules/analytics/events/misc/installation";
import { getExtensionInsallSource } from "store/selectors";
import PATHS from "config/constants/sub/paths";
import { useFeatureValue } from "@growthbook/growthbook-react";
import { useInitImplicitWidgetConfig } from "components/features/rules/TestThisRule/hooks/useInitImplicitWidgetConfig";

const ExtensionInstalled: React.FC = () => {
  const installSourcePage = useSelector(getExtensionInsallSource);
  const onboardingVariation = useFeatureValue("activation_without_onboarding", "variant");
  const { initImplicitWidgetConfig } = useInitImplicitWidgetConfig();

  useEffect(() => {
    initImplicitWidgetConfig();
  }, [initImplicitWidgetConfig]);

  useEffect(() => {
    trackExtensionInstalled();
  }, []);

  return <Navigate to={onboardingVariation === "control" ? installSourcePage ?? "/" : PATHS.RULES.MY_RULES.ABSOLUTE} />;
};

export default ExtensionInstalled;
