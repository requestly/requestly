import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setCurrentlySelectedRule,
  setIsCurrentlySelectedRuleHasUnsavedChanges,
} from "../../../../../../../../components/features/rules/RuleBuilder/actions";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import { getAppMode, getCurrentlySelectedRuleData, getUserAuthDetails } from "../../../../../../../../store/selectors";
import { getAllRules } from "store/features/rules/selectors";
import { Switch } from "antd";
import { toast } from "utils/Toast.js";
import { trackRuleEditorHeaderClicked } from "modules/analytics/events/common/rules";
import "./RuleEditorStatus.css";
import { PremiumFeature } from "features/pricing";
import { FeatureLimitType } from "hooks/featureLimiter/types";
import { PREMIUM_RULE_TYPES } from "features/rules";
import APP_CONSTANTS from "config/constants";
import { saveRule, validateSyntaxInRule as validateAndTransformSyntaxInRule } from "../actions";
import { useLocation } from "react-router-dom";
import { trackSampleRuleToggled } from "features/rules/analytics";

const Status = ({ isDisabled = false, isRuleEditorModal }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const currentlySelectedRuleData = useSelector(getCurrentlySelectedRuleData);
  const allRules = useSelector(getAllRules);
  const user = useSelector(getUserAuthDetails);
  const appMode = useSelector(getAppMode);

  //Component State
  const [hasUserTriedToChangeRuleStatus, setHasUserTriedToChangeRuleStatus] = useState(false);

  const isRuleCurrentlyActive = () => {
    return currentlySelectedRuleData.status === GLOBAL_CONSTANTS.RULE_STATUS.ACTIVE;
  };

  const changeRuleStatus = async (newValue) => {
    const ruleData = {
      ...currentlySelectedRuleData,
      status: newValue,
    };

    const isCreateMode = location.pathname.indexOf("create") !== -1;

    if (ruleData.isSample && !isCreateMode) {
      setCurrentlySelectedRule(dispatch, ruleData);
      saveRule(appMode, dispatch, ruleData)
        .then(() =>
          newValue === GLOBAL_CONSTANTS.RULE_STATUS.ACTIVE
            ? toast.success("Rule activated")
            : toast.success("Rule deactivated")
        )
        .then(() => setIsCurrentlySelectedRuleHasUnsavedChanges(dispatch, false));
      return;
    }

    //Syntactic Validation
    const syntaxValidatedAndTransformedRule = await validateAndTransformSyntaxInRule(dispatch, ruleData);

    if (!syntaxValidatedAndTransformedRule) {
      return;
    }

    if (newValue !== currentlySelectedRuleData.status) {
      setCurrentlySelectedRule(dispatch, ruleData);
    }

    // Toggling the status also saves the rule by running all the validations. Any unsaved change is saved when the status is toggled.
    !isCreateMode &&
      saveRule(appMode, dispatch, syntaxValidatedAndTransformedRule)
        .then(() =>
          newValue === GLOBAL_CONSTANTS.RULE_STATUS.ACTIVE
            ? toast.success("Rule saved and activated")
            : toast.success("Rule saved and deactivated")
        )
        .then(() => setIsCurrentlySelectedRuleHasUnsavedChanges(dispatch, false));
  };

  const stableChangeRuleStatus = useCallback(changeRuleStatus, [
    appMode,
    currentlySelectedRuleData,
    dispatch,
    location.pathname,
  ]);

  const toggleRuleStatus = (event) => {
    // event.preventDefault();
    setHasUserTriedToChangeRuleStatus(true);

    if (isRuleCurrentlyActive()) {
      changeRuleStatus(GLOBAL_CONSTANTS.RULE_STATUS.INACTIVE);
    } else {
      changeRuleStatus(GLOBAL_CONSTANTS.RULE_STATUS.ACTIVE);
    }
  };

  useEffect(() => {
    if (!hasUserTriedToChangeRuleStatus) {
      //sets the status of rule as active only if the rule is being created
      //status of rule remains same if the rule is being edited
      if (location.pathname.indexOf("create") !== -1) {
        stableChangeRuleStatus(GLOBAL_CONSTANTS.RULE_STATUS.ACTIVE);
      }
    }
  }, [allRules, stableChangeRuleStatus, user, location.pathname, hasUserTriedToChangeRuleStatus]);

  const isChecked = isRuleCurrentlyActive();

  return (
    <div className="display-row-center ml-2 rule-editor-header-switch" data-tour-id="rule-editor-status-toggle">
      <span className="rule-editor-header-switch-text text-gray">{isChecked ? "Enabled" : "Disabled"}</span>
      <PremiumFeature
        disabled={isDisabled || isChecked}
        popoverPlacement="bottom"
        onContinue={() => {
          toggleRuleStatus();

          if (currentlySelectedRuleData?.isSample) {
            trackSampleRuleToggled(
              currentlySelectedRuleData?.name,
              currentlySelectedRuleData?.status === GLOBAL_CONSTANTS.RULE_STATUS.ACTIVE
                ? GLOBAL_CONSTANTS.RULE_STATUS.INACTIVE
                : GLOBAL_CONSTANTS.RULE_STATUS.ACTIVE
            );
          }

          trackRuleEditorHeaderClicked(
            "toggle_status",
            currentlySelectedRuleData.ruleType,
            location.pathname.indexOf("create") !== -1 ? "create" : "edit",
            isRuleEditorModal ? "rule_editor_modal_header" : "rule_editor_screen_header"
          );
        }}
        features={
          PREMIUM_RULE_TYPES.includes(currentlySelectedRuleData.ruleType)
            ? [FeatureLimitType.num_active_rules, FeatureLimitType.response_rule]
            : [FeatureLimitType.num_active_rules]
        }
        featureName={`${APP_CONSTANTS.RULE_TYPES_CONFIG[currentlySelectedRuleData.ruleType]?.NAME} rule`}
        source={currentlySelectedRuleData.ruleType}
      >
        <Switch size="small" className="ml-3" checked={isChecked} disabled={isDisabled} />
      </PremiumFeature>
    </div>
  );
};

export default Status;
