import CreateRuleButton from "./CreateRuleButton";
import ShareRuleButton from "./ShareRuleButton";
import APP_CONSTANTS from "config/constants";
import "./RuleEditorActionButtons.css";

const ActionButtons = ({ mode }) => {
  return (
    <div className="rule-editor-header-action-btns">
      {mode === APP_CONSTANTS.RULE_EDITOR_CONFIG.MODES.EDIT ? <ShareRuleButton /> : null}
      <CreateRuleButton />
    </div>
  );
};

export default ActionButtons;
