import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { trackExtensionInstalled } from "modules/analytics/events/misc/installation";
import { getExtensionInsallSource } from "store/selectors";
import PATHS from "config/constants/sub/paths";
import { useFeatureValue } from "@growthbook/growthbook-react";

const ExtensionInstalled: React.FC = () => {
  const installSourcePage = useSelector(getExtensionInsallSource);
  const onboardingVariation = useFeatureValue("onboarding_activation_v2", "variant1");

  useEffect(() => {
    trackExtensionInstalled();
  }, []);

  return (
    <Navigate to={onboardingVariation === "variant1" ? PATHS.RULES.MY_RULES.ABSOLUTE : installSourcePage ?? "/"} />
  );
};

export default ExtensionInstalled;
