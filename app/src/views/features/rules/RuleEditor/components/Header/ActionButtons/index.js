import CreateRuleButton from "./CreateRuleButton";
import ShareRuleButton from "./ShareRuleButton";
import APP_CONSTANTS from "config/constants";
import { TeamRole } from "types";
import "./RuleEditorActionButtons.css";

const ActionButtons = ({ role, mode }) => {
  const isReadRole = role === TeamRole.read;

  return (
    <div className="rule-editor-header-action-btns">
      {mode === APP_CONSTANTS.RULE_EDITOR_CONFIG.MODES.EDIT || isReadRole ? <ShareRuleButton /> : null}

      {isReadRole ? null : <CreateRuleButton />}
    </div>
  );
};

export default ActionButtons;
