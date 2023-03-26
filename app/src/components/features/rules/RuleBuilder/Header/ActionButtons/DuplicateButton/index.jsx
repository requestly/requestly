import React, { useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "antd";
import { trackRuleEditorHeaderClicked } from "modules/analytics/events/common/rules";
import { getIsCurrentlySelectedRuleHasUnsavedChanges } from "store/selectors";
import { actions } from "store";
import { getModeData } from "../../../actions";
import { toast } from "utils/Toast";
import DuplicateRuleModal from "components/features/rules/DuplicateRuleModal";

const DuplicateButton = ({
  rule,
  isDisabled,
  handleRuleOptionsDropdownClose,
}) => {
  const { MODE } = getModeData(window.location);
  const dispatch = useDispatch();

  const isCurrentlySelectedRuleHasUnsavedChanges = useSelector(
    getIsCurrentlySelectedRuleHasUnsavedChanges
  );
  const [isDuplicateRuleModalActive, setIsDuplicateRuleModalActive] = useState(
    false
  );

  const closeDuplicateRuleModal = useCallback(() => {
    setIsDuplicateRuleModalActive(false);
  }, []);

  const onRuleDuplicated = useCallback(() => {
    closeDuplicateRuleModal();
    dispatch(actions.clearCurrentlySelectedRuleAndConfig());
    trackRuleEditorHeaderClicked("duplicate_button", rule.ruleType, MODE);
  }, [MODE, closeDuplicateRuleModal, dispatch, rule.ruleType]);

  const handleDuplicateRuleClick = useCallback(
    async (e) => {
      e.stopPropagation();
      handleRuleOptionsDropdownClose?.();

      if (isCurrentlySelectedRuleHasUnsavedChanges) {
        toast.warn("Please save changes before duplicating a rule");
        return;
      }

      setIsDuplicateRuleModalActive(true);
    },
    [handleRuleOptionsDropdownClose, isCurrentlySelectedRuleHasUnsavedChanges]
  );

  return (
    <>
      <Button
        type="text"
        disabled={isDisabled}
        onClick={handleDuplicateRuleClick}
      >
        Duplicate
      </Button>
      {isDuplicateRuleModalActive ? (
        <DuplicateRuleModal
          isOpen={isDuplicateRuleModalActive}
          close={closeDuplicateRuleModal}
          rule={rule}
          onDuplicate={onRuleDuplicated}
        />
      ) : null}
    </>
  );
};

export default DuplicateButton;
