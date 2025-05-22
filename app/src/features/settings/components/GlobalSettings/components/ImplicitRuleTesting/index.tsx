import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { getAppMode } from "store/selectors";
import SettingsItem from "../SettingsItem";
import { RuleTypesOptions } from "./components/RuleTypesOptions";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import { isFeatureCompatible } from "utils/CompatibilityUtils";
import APP_CONSTANTS from "config/constants";
import { getImplicitRuleTestingWidgetConfig, updateImplictRuleTestingWidgetConfig } from "./utils";

export const ImplicitRuleTesting = () => {
  const appMode = useSelector(getAppMode);
  const [isImplicitRuleTestingEnabled, setIsImplicitRuleTestingEnabled] = useState(false);
  const [enabledRuleTypes, setEnabledRuleTypes] = useState(null);
  const [widgetVisibility, setWidgetVisibility] = useState(
    GLOBAL_CONSTANTS.IMPLICIT_RULE_TESTING_WIDGET_VISIBILITY.ALL
  );

  const isCompatible = useMemo(() => isFeatureCompatible(APP_CONSTANTS.FEATURES.IMPLICIT_TEST_THIS_RULE), []);

  const handleImplicitRuleTestingToggleChange = useCallback(
    (status: boolean) => {
      setIsImplicitRuleTestingEnabled(status);

      updateImplictRuleTestingWidgetConfig(appMode, {
        enabled: status,
        ruleTypes: enabledRuleTypes,
        visibility: widgetVisibility,
      });
    },
    [appMode, enabledRuleTypes, widgetVisibility]
  );

  useEffect(() => {
    getImplicitRuleTestingWidgetConfig(appMode).then((data) => {
      if (!data) return;

      setEnabledRuleTypes(data.ruleTypes);
      setWidgetVisibility(data.visibility);
      if (data?.enabled) {
        setIsImplicitRuleTestingEnabled(true);
      } else setIsImplicitRuleTestingEnabled(false);
    });
  }, [appMode]);

  const onConfirm = () => {
    if (!isImplicitRuleTestingEnabled) {
    }
  };

  return isCompatible ? (
    <SettingsItem
      isActive={isImplicitRuleTestingEnabled}
      onChange={handleImplicitRuleTestingToggleChange}
      title="Show widget when rule is applied"
      caption="Enabling this option will display the widget on websites where any rules are enabled."
      confirmation={{
        title: <div></div>,
        onConfirm,
        icon: null,
        showCancel: true,
        okText: "Yes",
        cancelText: "No",
      }}
      settingsBody={
        <RuleTypesOptions
          enabledRuleTypes={enabledRuleTypes}
          setEnabledRuleTypes={setEnabledRuleTypes}
          isImplicitRuleTestingEnabled={isImplicitRuleTestingEnabled}
          widgetVisibility={widgetVisibility}
          setWidgetVisibility={setWidgetVisibility}
        />
      }
    />
  ) : null;
};
