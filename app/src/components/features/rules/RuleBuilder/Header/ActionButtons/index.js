//Sub-components
import CreateRuleButton from "./CreateRuleButton";
import ShareRuleButton from "./ShareRuleButton";
import { getModeData } from "../../actions";
import APP_CONSTANTS from "config/constants";
import "./RuleEditorActionButtons.css";

const ActionButtons = (props) => {
  const { MODE } = getModeData(props.location);

  return (
    <div className="rule-editor-header-action-btns">
      {MODE === APP_CONSTANTS.RULE_EDITOR_CONFIG.MODES.EDIT ? <ShareRuleButton /> : null}

      <CreateRuleButton location={props.location} />
    </div>
  );
};

export default ActionButtons;
