import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { getAppMode } from "store/selectors";
import SettingsItem from "../SettingsItem";
import { StorageService } from "init";
import ErrorCard from "components/misc/ErrorCard";
import { RuleTypesOptions } from "./components/RuleTypesOptions";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import { isFeatureCompatible } from "utils/CompatibilityUtils";
import APP_CONSTANTS from "config/constants";
import { updateImplictRuleTestingWidgetConfig } from "./utils";

export const ImplicitRuleTesting = () => {
  const appMode = useSelector(getAppMode);
  const [isImplicitRuleTestingEnabled, setIsImplicitRuleTestingEnabled] = useState(false);
  const [enabledRuleTypes, setEnabledRuleTypes] = useState(null);
  const [widgetVisibility, setWidgetVisibility] = useState(
    GLOBAL_CONSTANTS.IMPLICIT_RULE_TESTING_WIDGET_VISIBILITY.OFF
  );

  const isCompatible = useMemo(() => isFeatureCompatible(APP_CONSTANTS.FEATURES.TEST_THIS_RULE), []);

  const handleImplicitRuleTestingToggleChange = useCallback(
    (status: boolean) => {
      setIsImplicitRuleTestingEnabled(status);

      const newVisibility = status
        ? GLOBAL_CONSTANTS.IMPLICIT_RULE_TESTING_WIDGET_VISIBILITY.SPECIFIC
        : GLOBAL_CONSTANTS.IMPLICIT_RULE_TESTING_WIDGET_VISIBILITY.OFF;

      setWidgetVisibility(newVisibility);
      updateImplictRuleTestingWidgetConfig(appMode, {
        ruleTypes: enabledRuleTypes,
        visibility: newVisibility,
      });
    },
    [appMode, enabledRuleTypes]
  );

  useEffect(() => {
    StorageService(appMode)
      .getRecord(GLOBAL_CONSTANTS.STORAGE_KEYS.IMPLICIT_RULE_TESTING_WIDGET_CONFIG)
      .then((data) => {
        setEnabledRuleTypes(data.ruleTypes);
        setWidgetVisibility(data.visibility);
        if (data.visibility === GLOBAL_CONSTANTS.IMPLICIT_RULE_TESTING_WIDGET_VISIBILITY.OFF) {
          setIsImplicitRuleTestingEnabled(false);
        } else setIsImplicitRuleTestingEnabled(true);
      });
  }, [appMode]);

  return isCompatible ? (
    <SettingsItem
      isActive={isImplicitRuleTestingEnabled}
      onChange={handleImplicitRuleTestingToggleChange}
      title="Show widget when rule is applied"
      caption="Enabling this option will display the widget on websites where any rules are enabled."
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
  ) : (
    <ErrorCard
      type="warning"
      customErrorMessage="Please upgrade the extension to enable widget when rule is applied."
    />
  );
};
