import { useState } from "react";
import { RQButton } from "lib/design-system/components";
import { DeleteOutlined } from "@ant-design/icons";
import DeleteRulesModal from "components/features/rules/DeleteRulesModal";
import { getModeData } from "../../../../../../../../components/features/rules/RuleBuilder/actions";
import { trackRuleEditorHeaderClicked } from "modules/analytics/events/common/rules";

const DeleteButton = ({ rule, isDisabled, ruleDeletedCallback, isRuleEditorModal }) => {
  const { MODE } = getModeData(window.location);
  const [isDeleteConfirmationModalActive, setIsDeleteConfirmationModalActive] = useState(false);

  const toggleDeleteConfirmationModal = () => {
    setIsDeleteConfirmationModalActive(!isDeleteConfirmationModalActive);
  };

  const handleDeleteRuleClick = () => {
    setIsDeleteConfirmationModalActive(true);
    trackRuleEditorHeaderClicked(
      "delete_button",
      rule.ruleType,
      MODE,
      isRuleEditorModal ? "rule_editor_modal_header" : "rule_editor_screen_header"
    );
  };

  return (
    <>
      <RQButton
        iconOnly={isRuleEditorModal}
        type={isRuleEditorModal ? "default" : "text"}
        disabled={isDisabled}
        onClick={handleDeleteRuleClick}
        icon={isRuleEditorModal && <DeleteOutlined />}
      >
        {!isRuleEditorModal && "Delete rule"}
      </RQButton>

      {isDeleteConfirmationModalActive ? (
        <DeleteRulesModal
          isRuleEditor={true}
          isOpen={isDeleteConfirmationModalActive}
          toggle={toggleDeleteConfirmationModal}
          rulesToDelete={[rule]}
          ruleDeletedCallback={ruleDeletedCallback}
          analyticEventSource="rule_editor"
        />
      ) : null}
    </>
  );
};

export default DeleteButton;
