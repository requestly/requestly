import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Tooltip } from "antd";
import { globalActions } from "store/slices/global/slice";
import APP_CONSTANTS from "config/constants";
import { makeSelectRecordNamesByIds } from "store/features/rules/selectors";

const { RULE_TYPES_CONFIG, RULE_EDITOR_CONFIG } = APP_CONSTANTS;

const AppliedRules = ({ actions }) => {
  const dispatch = useDispatch();
  const ruleIds = Array.from(new Set((actions || []).map((a) => a.rule_id).filter(Boolean)));
  const selectNamesByIds = makeSelectRecordNamesByIds(ruleIds);
  const appliedRuleNamesMap = useSelector(selectNamesByIds);

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

  const render_rule_icon = (rule) => {
    if (!rule) {
      return null;
    }

    // Prefer showing the user-defined rule name in the tooltip; fall back to rule id when not found
    const ruleDisplayName = appliedRuleNamesMap?.[rule.rule_id] || rule.rule_id;

    return (
      <Tooltip title={ruleDisplayName} key={rule.rule_id}>
        <span style={{ paddingRight: "8px", cursor: "pointer" }} onClick={(e) => handleRuleIconClick(e, rule.rule_id)}>
          {RULE_TYPES_CONFIG[rule.rule_type].ICON()}
        </span>
      </Tooltip>
    );
  };

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

  return <>{deduped_rules.map((rule) => render_rule_icon(rule))}</>;
};

export default AppliedRules;
