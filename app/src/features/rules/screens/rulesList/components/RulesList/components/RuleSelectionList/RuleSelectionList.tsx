import React from "react";
import { RULE_DETAILS } from "./constants";
import { Divider } from "antd";
import { NavLink } from "react-router-dom";
import PATHS from "config/constants/sub/paths";
import { trackRuleCreationWorkflowStartedEvent } from "modules/analytics/events/common/rules";
import { RuleType } from "types";
import "./RuleSelectionList.scss";

interface RuleSelectionListProps {
  source?: string;
  groupId?: string;
}

export const RuleSelectionList: React.FC<RuleSelectionListProps> = ({ source = "my_rules", groupId }) => {
  const handleRuleTypeClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, ruleType: RuleType) => {
    trackRuleCreationWorkflowStartedEvent(ruleType, source);
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
                  <NavLink
                    end
                    key={rule.type}
                    className="rule-item"
                    state={{ source }}
                    onClick={(e) => handleRuleTypeClick(e, rule.type)}
                    to={
                      groupId
                        ? `${PATHS.RULE_EDITOR.CREATE_RULE.ABSOLUTE}/${rule.type}?groupId=${groupId}`
                        : `${PATHS.RULE_EDITOR.CREATE_RULE.ABSOLUTE}/${rule.type}`
                    }
                  >
                    <div className="icon">{rule.icon()}</div>
                    <div className="details">
                      <span className="title">{rule.title}</span>
                      <p className="description">{rule.description}</p>
                    </div>
                  </NavLink>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
