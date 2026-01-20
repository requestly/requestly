import React, { useMemo } from "react";
import { getAppMode } from "store/selectors";
import { useSelector } from "react-redux";
import { Checkbox, Radio } from "antd";
import { updateImplictRuleTestingWidgetConfig } from "../../utils";
import RULE_TYPES_CONFIG from "config/constants/sub/rule-types";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/constants";
import "./index.scss";

interface RuleTypesOptionsProps {
  enabledRuleTypes: string[];
  isImplicitRuleTestingEnabled: boolean;
  widgetVisibility: string;
  setEnabledRuleTypes: (ruleTypes: string[]) => void;
  setWidgetVisibility: (visibility: string) => void;
}

export const RuleTypesOptions: React.FC<RuleTypesOptionsProps> = ({
  enabledRuleTypes,
  setEnabledRuleTypes,
  isImplicitRuleTestingEnabled,
  widgetVisibility,
  setWidgetVisibility,
}) => {
  const appMode = useSelector(getAppMode);

  const options = useMemo(() => {
    return Object.values(RULE_TYPES_CONFIG)
      .filter((ruleConfig) => ruleConfig.ID !== 11)
      .map(({ TYPE, NAME }) => {
        return { label: NAME, value: TYPE };
      });
  }, []);

  const handleWidgetVisibilityChange = (value: string) => {
    setWidgetVisibility(value);
    updateImplictRuleTestingWidgetConfig(appMode, {
      enabled: true,
      ruleTypes: enabledRuleTypes,
      visibility: value,
    });
  };

  const handleRuleTypeSelection = (value: string[]) => {
    setEnabledRuleTypes(value);
    updateImplictRuleTestingWidgetConfig(appMode, {
      enabled: true,
      ruleTypes: value,
      visibility: widgetVisibility,
    });
  };

  if (!isImplicitRuleTestingEnabled) {
    return null;
  }

  return (
    <div className="implicit-test-rule-settings-container">
      <div className="implicit-test-rule-settings-radio-btn">
        <label className="implicit-test-rule-settings-label">Show widget on:</label>
        <div className="mt-8">
          <Radio.Group
            className="widget-visibility-radio-group"
            value={widgetVisibility}
            onChange={(e) => handleWidgetVisibilityChange(e.target.value)}
          >
            <Radio value={GLOBAL_CONSTANTS.IMPLICIT_RULE_TESTING_WIDGET_VISIBILITY.ALL}>All rules</Radio>
            <Radio value={GLOBAL_CONSTANTS.IMPLICIT_RULE_TESTING_WIDGET_VISIBILITY.SPECIFIC}>Specific rule</Radio>
          </Radio.Group>
        </div>
      </div>

      {widgetVisibility === GLOBAL_CONSTANTS.IMPLICIT_RULE_TESTING_WIDGET_VISIBILITY.SPECIFIC && (
        <div className="implicit-test-rule-types-list">
          <label className="implicit-test-rule-settings-label">Select rule type(s)</label>
          <Checkbox.Group
            className="rule-types-checkbox-group"
            options={options}
            value={enabledRuleTypes}
            onChange={(value: string[]) => {
              handleRuleTypeSelection(value);
            }}
          />
        </div>
      )}
    </div>
  );
};
