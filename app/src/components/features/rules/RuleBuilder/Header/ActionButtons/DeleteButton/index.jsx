import { useState } from "react";
import { RQButton } from "lib/design-system/components";
import { DeleteOutlined } from "@ant-design/icons";
import DeleteRulesModal from "components/features/rules/DeleteRulesModal";
import { getModeData } from "../../../actions";
import { trackRuleEditorHeaderClicked } from "modules/analytics/events/common/rules";

const DeleteButton = ({ rule, isDisabled, ruleDeletedCallback, isRuleEditorModal }) => {
  const { MODE } = getModeData(window.location);
  const [isDeleteConfirmationModalActive, setIsDeleteConfirmationModalActive] = useState(false);

  const toggleDeleteConfirmationModal = () => {
    setIsDeleteConfirmationModalActive(!isDeleteConfirmationModalActive);
  };

  const handleDeleteRuleClick = () => {
    setIsDeleteConfirmationModalActive(true);
    trackRuleEditorHeaderClicked("delete_button", rule.ruleType, MODE);
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
          recordsToDelete={[rule]}
          ruleIdsToDelete={[rule.id]}
          ruleDeletedCallback={ruleDeletedCallback}
        />
      ) : null}
    </>
  );
};

export default DeleteButton;
