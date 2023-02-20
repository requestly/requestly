import { Tooltip } from "antd";
import { useNavigate } from "react-router-dom";
import { redirectToRuleEditor } from "utils/RedirectionUtils";
import RULE_TYPES_CONFIG from "../../../../../../../../config/constants/sub/rule-types";

const AppliedRules = ({ actions }) => {
  const navigate = useNavigate();

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

  const rule_icon_on_click_handler = (rule_id) => {
    redirectToRuleEditor(navigate, rule_id);
  };

  const render_rule_icon = (rule) => {
    if (!rule) {
      return null;
    }

    return (
      <Tooltip title={rule.rule_id} key={rule.rule_id}>
        <span
          style={{ paddingRight: "8px", cursor: "pointer" }}
          onClick={() => rule_icon_on_click_handler(rule.rule_id)}
        >
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
