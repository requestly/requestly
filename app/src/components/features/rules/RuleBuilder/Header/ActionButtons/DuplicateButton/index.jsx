import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Button } from "antd";
import { copyRule } from "components/features/rules/actions/someMoreActions";
import { trackRQLastActivity } from "utils/AnalyticsUtils";
import {
  trackRuleDuplicatedEvent,
  trackRuleEditorHeaderClicked,
} from "modules/analytics/events/common/rules";
import {
  getAppMode,
  getIsCurrentlySelectedRuleHasUnsavedChanges,
} from "store/selectors";
import { actions } from "store";
import { getModeData } from "../../../actions";
import { toast } from "utils/Toast";

const DuplicateButton = ({
  rule,
  isDisabled,
  handleRuleOptionsDropdownClose,
}) => {
  const { MODE } = getModeData(window.location);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const appMode = useSelector(getAppMode);
  const isCurrentlySelectedRuleHasUnsavedChanges = useSelector(
    getIsCurrentlySelectedRuleHasUnsavedChanges
  );

  const handleDuplicateRuleClick = (e) => {
    e.stopPropagation();

    if (isCurrentlySelectedRuleHasUnsavedChanges) {
      toast.warn("Please save changes before duplicating a rule");
      return;
    }

    copyRule(appMode, rule, navigate, () =>
      dispatch(actions.clearCurrentlySelectedRuleAndConfig())
    );

    handleRuleOptionsDropdownClose?.();
    trackRQLastActivity("rule_duplicated");
    trackRuleDuplicatedEvent(rule.ruleType);
    trackRuleEditorHeaderClicked("duplicate_button", rule.ruleType, MODE);
  };

  return (
    <Button
      type="text"
      disabled={isDisabled}
      onClick={handleDuplicateRuleClick}
    >
      Duplicate
    </Button>
  );
};

export default DuplicateButton;
