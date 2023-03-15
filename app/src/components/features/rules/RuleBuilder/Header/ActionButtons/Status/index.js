import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentlySelectedRule } from "../../../actions";
import APP_CONSTANTS from "../../../../../../../config/constants";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import {
  getAllRules,
  getAppMode,
  getCurrentlySelectedRuleData,
  getUserAuthDetails,
} from "../../../../../../../store/selectors";
import { Switch } from "antd";
import { toast } from "utils/Toast.js";
import { saveRule } from "../actions/index";
import "./RuleEditorStatus.css";
import { trackRuleEditorHeaderClicked } from "modules/analytics/events/common/rules";

const Status = ({ isDisabled, location }) => {
  //Global State
  const dispatch = useDispatch();
  const currentlySelectedRuleData = useSelector(getCurrentlySelectedRuleData);
  const allRules = useSelector(getAllRules);
  const user = useSelector(getUserAuthDetails);
  const appMode = useSelector(getAppMode);

  //Component State
  const [
    hasUserTriedToChangeRuleStatus,
    setHasUserTriedToChangeRuleStatus,
  ] = useState(false);

  // fetch planName from global state
  const planNameFromState =
    user.details?.planDetails?.planName ||
    APP_CONSTANTS.PRICING.PLAN_NAMES.BRONZE;

  const isRuleCurrentlyActive = () => {
    return (
      currentlySelectedRuleData.status === GLOBAL_CONSTANTS.RULE_STATUS.ACTIVE
    );
  };

  const changeRuleStatus = (newValue) => {
    if (newValue !== currentlySelectedRuleData.status)
      setCurrentlySelectedRule(dispatch, {
        ...currentlySelectedRuleData,
        status: newValue,
      });

    const callback = () =>
      newValue === GLOBAL_CONSTANTS.RULE_STATUS.ACTIVE
        ? toast.success("Rule saved and activated")
        : toast.success("Rule saved and deactivated");

    const isCreateMode = location.pathname.indexOf("create") !== -1;

    !isCreateMode &&
      saveRule(
        appMode,

        {
          ...currentlySelectedRuleData,
          status: newValue,
        },

        callback
      );
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
  }, [
    allRules,
    stableChangeRuleStatus,
    user,
    location.pathname,
    hasUserTriedToChangeRuleStatus,
    planNameFromState,
  ]);

  const isChecked = isRuleCurrentlyActive();

  return (
    <div className="display-row-center ml-2 rule-editor-header-switch">
      <span className="rule-editor-header-switch-text text-gray">
        {isChecked ? "Enabled" : "Disabled"}
      </span>
      <Switch
        size="small"
        className="ml-3"
        checked={isChecked}
        onChange={toggleRuleStatus}
        disabled={isDisabled}
        onClick={() => {
          trackRuleEditorHeaderClicked(
            "toggle_status",
            currentlySelectedRuleData.ruleType,
            location.pathname.indexOf("create") !== -1 ? "create" : "edit"
          );
        }}
      />
    </div>
  );
};

export default Status;
