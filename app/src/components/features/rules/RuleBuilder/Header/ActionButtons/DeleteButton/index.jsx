import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "antd";
import DeleteRulesModal from "components/features/rules/DeleteRulesModal";
import APP_CONSTANTS from "config/constants";
import { getModeData } from "../../../actions";
import { trackRuleEditorHeaderClicked } from "modules/analytics/events/common/rules";

const DeleteButton = ({ rule, isDisabled, handleRuleOptionsDropdownClose }) => {
  const { MODE } = getModeData(window.location);
  const [
    isDeleteConfirmationModalActive,
    setIsDeleteConfirmationModalActive,
  ] = useState(false);

  const navigate = useNavigate();

  const toggleDeleteConfirmationModal = () => {
    setIsDeleteConfirmationModalActive(!isDeleteConfirmationModalActive);
  };

  const handleDeleteRuleClick = () => {
    setIsDeleteConfirmationModalActive(true);
    handleRuleOptionsDropdownClose?.();
    trackRuleEditorHeaderClicked("delete_button", rule.ruleType, MODE);
  };

  const handleNavigationAfterDelete = useCallback(() => {
    navigate(APP_CONSTANTS.PATHS.RULES.MY_RULES.ABSOLUTE);
  }, [navigate]);

  return (
    <>
      <Button type="text" disabled={isDisabled} onClick={handleDeleteRuleClick}>
        Delete rule
      </Button>

      {isDeleteConfirmationModalActive ? (
        <DeleteRulesModal
          isRuleEditor={true}
          isOpen={isDeleteConfirmationModalActive}
          toggle={toggleDeleteConfirmationModal}
          recordsToDelete={[rule]}
          ruleIdsToDelete={[rule.id]}
          handleNavigationAfterDelete={handleNavigationAfterDelete}
        />
      ) : null}
    </>
  );
};

export default DeleteButton;
