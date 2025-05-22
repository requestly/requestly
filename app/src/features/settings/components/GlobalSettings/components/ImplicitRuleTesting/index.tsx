import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { getAppMode } from "store/selectors";
import SettingsItem from "../SettingsItem";
import { RuleTypesOptions } from "./components/RuleTypesOptions";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import { isFeatureCompatible } from "utils/CompatibilityUtils";
import APP_CONSTANTS from "config/constants";
import { getImplicitRuleTestingWidgetConfig, updateImplictRuleTestingWidgetConfig } from "./utils";
import { MdInfoOutline } from "@react-icons/all-files/md/MdInfoOutline";
import { trackSettingsToggled } from "modules/analytics/events/misc/settings";
import "./implicitRuleTesting.scss";

export const ImplicitRuleTesting = () => {
  const appMode = useSelector(getAppMode);
  const [isImplicitRuleTestingEnabled, setIsImplicitRuleTestingEnabled] = useState(false);
  const [enabledRuleTypes, setEnabledRuleTypes] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [widgetVisibility, setWidgetVisibility] = useState(
    GLOBAL_CONSTANTS.IMPLICIT_RULE_TESTING_WIDGET_VISIBILITY.ALL
  );

  const isCompatible = useMemo(() => isFeatureCompatible(APP_CONSTANTS.FEATURES.IMPLICIT_TEST_THIS_RULE), []);

  const handleImplicitRuleTestingToggleChange = useCallback(
    (status: boolean) => {
      trackSettingsToggled("implicit_rule_applied_widget", status);
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
      } else {
        setIsImplicitRuleTestingEnabled(false);
      }
    });
  }, [appMode]);

  const onConfirm = () => {
    handleImplicitRuleTestingToggleChange(false);
    setShowConfirmation(false);
  };

  const onCancel = () => {
    setShowConfirmation(false);
  };

  const onChange = (status: boolean) => {
    if (status) {
      handleImplicitRuleTestingToggleChange(true);
    } else {
      setShowConfirmation(true);
    }
  };

  return isCompatible ? (
    <SettingsItem
      isActive={isImplicitRuleTestingEnabled}
      onChange={onChange}
      title="Show widget when rule is applied"
      caption={
        <>
          Enabling this option will display the widget on websites where any rules are enabled.{" "}
          <a
            target="_blank"
            rel="noreferrer"
            href="https://docs.requestly.com/general/http-rules/advanced-usage/test-rules"
          >
            Read more
          </a>
        </>
      }
      confirmation={{
        open: showConfirmation,
        placement: "bottom",
        overlayClassName: "implicit-rule-switch-confirmation",
        title: (
          <>
            <div className="title-container">
              <MdInfoOutline className="icon" />
              <span className="title">Hide Requestly widget</span>
            </div>
            <div className="description">
              This widget shows rule executions. Some changes, such as response body and header modifications, are not
              visible in DevTools due to technical limitations. Do you still want to hide the widget?
            </div>
          </>
        ),
        onCancel,
        onConfirm,
        icon: null,
        showCancel: true,
        okText: "Hide widget",
        okButtonProps: {
          size: "small",
          className: "rq-custom-btn",
        },
        cancelText: "Cancel",
        cancelButtonProps: {
          size: "small",
          className: "rq-custom-btn",
        },
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
