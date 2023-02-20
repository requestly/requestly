import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "antd";
import {
  getUserAuthDetails,
  getIsCurrentlySelectedRuleHasUnsavedChanges,
} from "store/selectors";
import ExportRulesModal from "components/features/rules/ExportRulesModal";
import APP_CONSTANTS from "config/constants";
import { actions } from "store";
import { getModeData } from "../../../actions";
import { trackRuleEditorHeaderClicked } from "modules/analytics/events/common/rules";
import { toast } from "utils/Toast";

const ExportButton = ({ rule, isDisabled, handleRuleOptionsDropdownClose }) => {
  const { MODE } = getModeData(window.location);
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const isCurrentlySelectedRuleHasUnsavedChanges = useSelector(
    getIsCurrentlySelectedRuleHasUnsavedChanges
  );
  const [isExportRuleModalActive, setIsExportRuleModalActive] = useState(false);
  const { id, ruleType } = rule;

  const toggleExportRuleModal = () => {
    setIsExportRuleModalActive((prev) => !prev);
  };

  const handleExportRuleClick = () => {
    if (isCurrentlySelectedRuleHasUnsavedChanges) {
      toast.warn("Please save changes before export");
      return;
    }

    trackRuleEditorHeaderClicked("export_button", ruleType, MODE);
    if (user.loggedIn) {
      setIsExportRuleModalActive(true);
      handleRuleOptionsDropdownClose?.();
      return;
    }

    dispatch(
      actions.toggleActiveModal({
        modalName: "authModal",
        newValue: true,
        newProps: {
          redirectURL: window.location.href,
          src: APP_CONSTANTS.FEATURES.RULES,
          callback: () => setIsExportRuleModalActive(true),
          authMode: APP_CONSTANTS.AUTH.ACTION_LABELS.SIGN_UP,
          userActionMessage: "Sign up to export the rule",
          eventSource: "export_rule",
        },
      })
    );
  };

  return (
    <>
      <Button type="text" disabled={isDisabled} onClick={handleExportRuleClick}>
        Export
      </Button>

      {isExportRuleModalActive ? (
        <ExportRulesModal
          isOpen={isExportRuleModalActive}
          toggle={toggleExportRuleModal}
          rulesToExport={[id]}
        />
      ) : null}
    </>
  );
};

export default ExportButton;
