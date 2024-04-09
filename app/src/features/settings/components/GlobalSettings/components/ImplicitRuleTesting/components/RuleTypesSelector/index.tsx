import React, { useMemo } from "react";
import { getAppMode } from "store/selectors";
import { useSelector } from "react-redux";
import { Checkbox, Radio } from "antd";
import { StorageService } from "init";
import RULE_TYPES_CONFIG from "config/constants/sub/rule-types";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import "./index.scss";

interface RuleTypesSelectorProps {
  enabledRuleTypes: string[];
  setEnabledRuleTypes: (ruleTypes: string[]) => void;
  isImplicitRuleTestingEnabled: boolean;
  widgetVisibility: string;
  setWidgetVisibility: (visibility: string) => void;
}

export const RuleTypesSelector: React.FC<RuleTypesSelectorProps> = ({
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
    StorageService(appMode).saveRecord({
      [GLOBAL_CONSTANTS.IMPLICIT_RULE_TESTING_WIDGET_CONFIG]: {
        ruleTypes: enabledRuleTypes,
        visibility: value,
      },
    });
  };

  const handleRuleTypeSelection = (value: string[]) => {
    setEnabledRuleTypes(value);
    StorageService(appMode).saveRecord({
      [GLOBAL_CONSTANTS.IMPLICIT_RULE_TESTING_WIDGET_CONFIG]: {
        ruleTypes: value,
        visibility: widgetVisibility,
      },
    });
  };

  if (!isImplicitRuleTestingEnabled) {
    return null;
  }

  return (
    <div className="implicit-test-rule-settings-container">
      <div className="implicit-test-rule-settings-radio-btn">
        <label>Show widget on:</label>
        <div>
          <Radio.Group value={widgetVisibility} onChange={(e) => handleWidgetVisibilityChange(e.target.value)}>
            <Radio value={GLOBAL_CONSTANTS.IMPLICIT_RULE_TESTING_WIDGET_VISIBILITY.ALL}>All rules</Radio>
            <Radio value={GLOBAL_CONSTANTS.IMPLICIT_RULE_TESTING_WIDGET_VISIBILITY.SPECIFIC}>Specific rule</Radio>
          </Radio.Group>
        </div>
      </div>

      {widgetVisibility === GLOBAL_CONSTANTS.IMPLICIT_RULE_TESTING_WIDGET_VISIBILITY.SPECIFIC && (
        <div className="implicit-test-rule-types-list">
          <label>Select rule type(s)</label>
          <Checkbox.Group
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
