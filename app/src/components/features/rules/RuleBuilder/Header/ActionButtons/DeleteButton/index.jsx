import { useState } from "react";
import { Button } from "antd";
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
      <Button
        type="text"
        disabled={isDisabled}
        onClick={handleDeleteRuleClick}
        icon={isRuleEditorModal && <DeleteOutlined />}
      >
        {!isRuleEditorModal && "Delete rule"}
      </Button>

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
