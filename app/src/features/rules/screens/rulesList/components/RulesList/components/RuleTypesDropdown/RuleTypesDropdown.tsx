import React, { useMemo } from "react";
import { DropDownProps, Dropdown, Menu } from "antd";
import { PremiumIcon } from "components/common/PremiumIcon";
import APP_CONSTANTS from "config/constants";
import RULE_TYPES_CONFIG from "config/constants/sub/rule-types";
import { PremiumFeature } from "features/pricing";
import { FeatureLimitType } from "hooks/featureLimiter/types";
import { useFeatureLimiter } from "hooks/featureLimiter/useFeatureLimiter";
import { RuleType } from "types";
import { useRulesActionContext } from "features/rules/context/actions";

interface Props {
  groupId?: string;
  children: React.ReactNode;
  analyticEventSource: string;
  placement?: DropDownProps["placement"];
}

export const RuleTypesDropdown: React.FC<Props> = ({
  groupId,
  children,
  placement = "bottom",
  analyticEventSource,
}) => {
  const { getFeatureLimitValue } = useFeatureLimiter();
  const { createRuleAction } = useRulesActionContext();

  const checkIsPremiumRule = (ruleType: RuleType) => {
    const featureName = `${ruleType.toLowerCase()}_rule`;
    return !getFeatureLimitValue(featureName as FeatureLimitType);
  };

  const menuItems = useMemo(
    () => (
      <Menu>
        {Object.values(RULE_TYPES_CONFIG)
          .filter((ruleConfig) => ruleConfig.ID !== 11)
          .map(({ ID, TYPE, ICON, NAME }, index) => (
            <PremiumFeature
              key={index}
              popoverPlacement="topLeft"
              onContinue={() => createRuleAction(TYPE, analyticEventSource, groupId)}
              features={[`${TYPE.toLowerCase()}_rule` as FeatureLimitType, FeatureLimitType.num_rules]}
              featureName={`${APP_CONSTANTS.RULE_TYPES_CONFIG[TYPE]?.NAME} rule`}
              source={analyticEventSource}
              onClickCallback={(e) => e?.domEvent?.stopPropagation?.()}
            >
              <Menu.Item icon={<ICON />} className="rule-selection-dropdown-btn-overlay-item">
                {NAME}
                {checkIsPremiumRule(TYPE) ? (
                  <PremiumIcon
                    key={index}
                    placement="topLeft"
                    source="rule_dropdown"
                    featureType={`${TYPE.toLowerCase()}_rule` as FeatureLimitType}
                  />
                ) : null}
              </Menu.Item>
            </PremiumFeature>
          ))}
      </Menu>
    ),
    []
  );

  return (
    <Dropdown trigger={["click"]} placement={placement} overlay={menuItems}>
      {children}
    </Dropdown>
  );
};
