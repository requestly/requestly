import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { Tooltip } from "antd";
import { actions as storeActions } from "store";
import APP_CONSTANTS from "config/constants";

const { RULE_TYPES_CONFIG, RULE_EDITOR_CONFIG } = APP_CONSTANTS;

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
        storeActions.toggleActiveModal({
          newValue: true,
          modalName: "ruleEditorModal",
          newProps: { ruleId, mode: RULE_EDITOR_CONFIG.MODES.EDIT },
        })
      );
    },
    [dispatch]
  );

  const render_rule_icon = (rule) => {
    if (!rule) {
      return null;
    }

    return (
      <Tooltip title={rule.rule_id} key={rule.rule_id}>
        <span style={{ paddingRight: "8px", cursor: "pointer" }} onClick={(e) => handleRuleIconClick(e, rule.rule_id)}>
          {RULE_TYPES_CONFIG[rule.rule_type].ICON()}
        </span>
      </Tooltip>
    );
  };

  const get_rules_from_actions = (actions) => {
    const rules = actions.map((action) => {
      return {
        rule_type: action.ruleType,
        rule_id: action.ruleId,
      };
    });
    return rules;
  };

  const rules = get_rules_from_actions(actions);
  const deduped_rules = dedup_rules(rules);

  return <>{deduped_rules.map((rule) => render_rule_icon(rule))}</>;
};

export default AppliedRules;
