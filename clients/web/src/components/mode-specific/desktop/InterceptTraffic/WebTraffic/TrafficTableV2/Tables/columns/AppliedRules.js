import React, { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Tooltip } from "antd";
import { globalActions } from "store/slices/global/slice";
import APP_CONSTANTS from "config/constants";
import { getRecordById } from "store/features/rules/selectors";

const { RULE_TYPES_CONFIG, RULE_EDITOR_CONFIG } = APP_CONSTANTS;

const RenderRule = ({ ruleId, ruleType, onRuleClick }) => {
  const rule = useSelector((state) => getRecordById(state, ruleId));
  const ruleDisplayName = rule?.name || ruleId;

  return (
    <Tooltip title={ruleDisplayName}>
      <span 
        style={{ paddingRight: "8px", cursor: "pointer" }} 
        onClick={(e) => onRuleClick(e, ruleId)}
      >
        {RULE_TYPES_CONFIG[ruleType]?.ICON?.() || null}
      </span>
    </Tooltip>
  );
};

const AppliedRules = ({ actions }) => {
  const dispatch = useDispatch();

  const dedup_rules = (rules) => {
    const rule_ids = [];

    return rules.filter((rule) => {
      if (!rule_ids.includes(rule.rule_id)) {
        rule_ids.push(rule.rule_id);
        return true;
      }
      return false;
    });
  };

  const handleRuleIconClick = useCallback(
    (e, ruleId) => {
      e.stopPropagation();

      dispatch(
        globalActions.toggleActiveModal({
          newValue: true,
          modalName: "ruleEditorModal",
          newProps: { ruleId, mode: RULE_EDITOR_CONFIG.MODES.EDIT },
        })
      );
    },
    [dispatch]
  );


  const get_rules_from_actions = (actions) => {
    const rules = actions.map((action) => {
      return {
        rule_type: action.rule_type,
        rule_id: action.rule_id,
      };
    });
    return rules;
  };

  const rules = get_rules_from_actions(actions);
  const deduped_rules = dedup_rules(rules);

  return <>{deduped_rules.map((rule) => <RenderRule key={rule.rule_id} ruleId={rule.rule_id} ruleType={rule.rule_type} onRuleClick={handleRuleIconClick} />)}</>;
};

export default AppliedRules;
