import React, { useCallback, useMemo } from "react";
import { Button, Dropdown, Menu } from "antd";
import { PremiumIcon } from "components/common/PremiumIcon";
import APP_CONSTANTS from "config/constants";
import RULE_TYPES_CONFIG from "config/constants/sub/rule-types";
import { PremiumFeature } from "features/pricing";
import { FeatureLimitType } from "hooks/featureLimiter/types";
import { useFeatureLimiter } from "hooks/featureLimiter/useFeatureLimiter";
import { SOURCE } from "modules/analytics/events/common/constants";
import {
  trackNewRuleButtonClicked,
  trackRuleCreationWorkflowStartedEvent,
} from "modules/analytics/events/common/rules";
import { useNavigate } from "react-router-dom";
import { RuleType } from "types";
import { redirectToCreateNewRule } from "utils/RedirectionUtils";
import { MdAdd } from "@react-icons/all-files/md/MdAdd";

/* TODO: REFACTOR THIS COMPONENT
  Currently created a separate component for create new rule button with rule types dropdown
*/

export const NewRuleButtonWithDropdown: React.FC<{ disable?: boolean; callback?: () => void }> = ({
  disable = false,
  callback = () => {},
}) => {
  const navigate = useNavigate();
  const { getFeatureLimitValue } = useFeatureLimiter();

  const handleCreateNewRule = useCallback(
    (ruleType: RuleType, source: string) => {
      if (ruleType) {
        trackRuleCreationWorkflowStartedEvent(ruleType, source);
      } else {
        trackNewRuleButtonClicked("in_app");
      }

      callback();
      redirectToCreateNewRule(navigate, ruleType, source || "my_rules");
    },
    [navigate, callback]
  );

  const dropdownOverlay = useMemo(() => {
    // FIXME: RuleType needed?
    const checkIsPremiumRule = (ruleType: RuleType) => {
      const featureName = `${ruleType.toLowerCase()}_rule`;
      return !getFeatureLimitValue(featureName as FeatureLimitType);
    };

    return (
      <Menu>
        {Object.values(RULE_TYPES_CONFIG)
          .filter((ruleConfig) => ruleConfig.ID !== 11)
          .map(({ ID, TYPE, ICON, NAME }) => (
            <PremiumFeature
              popoverPlacement="topLeft"
              onContinue={() => handleCreateNewRule(TYPE as RuleType, SOURCE.DROPDOWN)}
              features={[`${TYPE.toLowerCase()}_rule` as FeatureLimitType, FeatureLimitType.num_rules]}
              featureName={`${APP_CONSTANTS.RULE_TYPES_CONFIG[TYPE]?.NAME} rule`}
              source="rule_selection_dropdown"
            >
              <Menu.Item key={ID} icon={<ICON />} className="rule-selection-dropdown-btn-overlay-item">
                {NAME}
                {checkIsPremiumRule(TYPE as RuleType) ? (
                  <PremiumIcon
                    placement="topLeft"
                    source="rule_dropdown"
                    featureType={`${TYPE.toLowerCase()}_rule` as FeatureLimitType}
                  />
                ) : null}
              </Menu.Item>
            </PremiumFeature>
          ))}
      </Menu>
    );
  }, [getFeatureLimitValue, handleCreateNewRule]);

  return (
    <Dropdown disabled={disable} trigger={["click"]} overlay={dropdownOverlay} className="rule-selection-dropdown-btn">
      <Button icon={<MdAdd className="anticon" />} type="primary">
        Create new rule
      </Button>
    </Dropdown>
  );
};
