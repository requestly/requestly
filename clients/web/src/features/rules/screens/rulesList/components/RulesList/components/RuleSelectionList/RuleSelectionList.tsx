import React from "react";
import { RULE_DETAILS } from "./constants";
import { Divider } from "antd";
import { NavLink, useNavigate } from "react-router-dom";
import PATHS from "config/constants/sub/paths";
import { trackRuleCreationWorkflowStartedEvent } from "modules/analytics/events/common/rules";
import { useFeatureLimiter } from "hooks/featureLimiter/useFeatureLimiter";
import { FeatureLimitType } from "hooks/featureLimiter/types";
import { PremiumFeature } from "features/pricing";
import { PremiumIcon } from "components/common/PremiumIcon";
import { TooltipPlacement } from "antd/lib/tooltip";
import { redirectToCreateNewRule } from "utils/RedirectionUtils";
import { PaidFeatureNudgeViewedSource } from "modules/analytics/events/common/pricing";
import "./RuleSelectionList.scss";
import { RuleType } from "@requestly/shared/types/entities/rules";

export interface RuleSelectionListProps {
  /** Analytics event source */
  source?: string;
  groupId?: string;
  premiumPopoverPlacement?: TooltipPlacement;
  callback?: () => void;

  /** Premium icon analytics event source */
  premiumIconSource: PaidFeatureNudgeViewedSource;
  onRuleItemClick?: (ruleType: RuleType) => void;
}

export const RuleSelectionList: React.FC<RuleSelectionListProps> = ({
  source = "my_rules",
  groupId,
  premiumPopoverPlacement = "topLeft",
  callback = () => {},
  premiumIconSource,
  onRuleItemClick = () => {},
}) => {
  const navigate = useNavigate();
  const { getFeatureLimitValue } = useFeatureLimiter();

  const handleRuleTypeClick = (ruleType: RuleType) => {
    trackRuleCreationWorkflowStartedEvent(ruleType, source);

    callback();

    onRuleItemClick(ruleType);

    redirectToCreateNewRule(navigate, ruleType, source, groupId);
  };

  const checkIsPremiumRule = (ruleType: RuleType) => {
    const featureName = `${ruleType.toLowerCase()}_rule`;
    return !getFeatureLimitValue(featureName as FeatureLimitType);
  };

  return (
    <div className="rule-selection-list-container">
      {RULE_DETAILS.categories.map(({ title, type, rules }) => {
        return (
          <div key={type}>
            <div className="rule-category-title">
              <span className="title">{title}</span> <Divider plain />
            </div>
            <div>
              {rules.map((rule) => {
                return (
                  <PremiumFeature
                    key={rule.type}
                    source={source}
                    featureName={`${rule.title} rule`}
                    popoverPlacement={premiumPopoverPlacement}
                    onContinue={() => handleRuleTypeClick(rule.type)}
                    onUpgradeYourselfClickCallback={() => onRuleItemClick(rule.type)}
                    onUpgradeForFreeClickCallback={() => onRuleItemClick(rule.type)}
                    features={[`${rule.type.toLowerCase()}_rule` as FeatureLimitType, FeatureLimitType.num_rules]}
                    onClickCallback={(e) => {
                      e?.preventDefault?.();
                    }}
                  >
                    <NavLink
                      end
                      className={({ isActive }) => `rule-item-container ${isActive ? "active" : ""}`}
                      state={{ source }}
                      onClick={(e) => {
                        e.preventDefault();
                      }}
                      to={
                        groupId
                          ? `${PATHS.RULE_EDITOR.CREATE_RULE.ABSOLUTE}/${rule.type}?groupId=${groupId}`
                          : `${PATHS.RULE_EDITOR.CREATE_RULE.ABSOLUTE}/${rule.type}`
                      }
                    >
                      <div className="rule-item">
                        <div className="icon">{rule.icon()}</div>
                        <div className="details">
                          <span className="title">{rule.title}</span>
                          <p className="description">{rule.description}</p>
                        </div>

                        {checkIsPremiumRule(rule.type) ? (
                          <div className="premium-icon-container">
                            <PremiumIcon
                              placement="topLeft"
                              source={premiumIconSource}
                              featureType={`${rule.type.toLowerCase()}_rule` as FeatureLimitType}
                            />
                          </div>
                        ) : null}
                      </div>
                    </NavLink>
                  </PremiumFeature>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
