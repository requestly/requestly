import { useSelector } from "react-redux";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
//Sub-components
import CreateRuleButton from "./CreateRuleButton";
import ShareRuleButton from "./ShareRuleButton";
import { getCurrentlySelectedRuleData } from "store/selectors";
import { getModeData } from "../../actions";
import APP_CONSTANTS from "config/constants";
import "./RuleEditorActionButtons.css";

const ActionButtons = (props) => {
  const { MODE } = getModeData(props.location);
  const rule = useSelector(getCurrentlySelectedRuleData);

  const isDisabled = rule?.ruleType === GLOBAL_CONSTANTS.RULE_TYPES.REQUEST;

  return (
    <div className="rule-editor-header-action-btns">
      {MODE === APP_CONSTANTS.RULE_EDITOR_CONFIG.MODES.EDIT ? <ShareRuleButton /> : null}

      <CreateRuleButton isDisabled={isDisabled} location={props.location} />
    </div>
  );
};

export default ActionButtons;
