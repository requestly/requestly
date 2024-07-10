import React from "react";
import { RULE_DETAILS } from "./constants";
import { Divider } from "antd";
import "./RuleSelectionList.scss";

interface RuleSelectionListProps {}

export const RuleSelectionList: React.FC<RuleSelectionListProps> = () => {
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
                  <div key={rule.type} className="rule-item">
                    <div className="icon">{rule.icon()}</div>
                    <div className="details">
                      <span className="title">{rule.title}</span>
                      <p className="description">{rule.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
