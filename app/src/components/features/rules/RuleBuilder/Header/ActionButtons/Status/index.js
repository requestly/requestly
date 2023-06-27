import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useFeatureValue } from "@growthbook/growthbook-react";
import { setCurrentlySelectedRule } from "../../../actions";
import { ProductWalkthrough } from "components/misc/ProductWalkthrough";
import APP_CONSTANTS from "../../../../../../../config/constants";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import { MISC_TOURS, TOUR_TYPES } from "components/misc/ProductWalkthrough/constants";
import {
  getAllRules,
  getAppMode,
  getCurrentlySelectedRuleData,
  getUserAuthDetails,
  getUserAttributes,
  getIsMiscTourCompleted,
} from "../../../../../../../store/selectors";
import { actions } from "store";
import FEATURES from "config/constants/sub/features";
import { Switch } from "antd";
import { toast } from "utils/Toast.js";
import { StorageService } from "init";
import { isFeatureCompatible } from "utils/CompatibilityUtils";
import { trackRuleEditorHeaderClicked } from "modules/analytics/events/common/rules";
import "./RuleEditorStatus.css";

const Status = ({ location, isRuleEditorModal }) => {
  //Global State
  const dispatch = useDispatch();
  const currentlySelectedRuleData = useSelector(getCurrentlySelectedRuleData);
  const allRules = useSelector(getAllRules);
  const user = useSelector(getUserAuthDetails);
  const userAttributes = useSelector(getUserAttributes);
  const appMode = useSelector(getAppMode);
  const isMiscTourCompleted = useSelector(getIsMiscTourCompleted);
  const groupingAndRuleActivationExp = useFeatureValue("grouping_and_rule_activation", null);

  const isDisabled =
    currentlySelectedRuleData?.ruleType === GLOBAL_CONSTANTS.RULE_TYPES.REQUEST &&
    !isFeatureCompatible(FEATURES.MODIFY_REQUEST_BODY);

  //Component State
  const [hasUserTriedToChangeRuleStatus, setHasUserTriedToChangeRuleStatus] = useState(false);
  const [startWalkthrough, setStartWalkthrough] = useState(false);

  // fetch planName from global state
  const planNameFromState = user.details?.planDetails?.planName || APP_CONSTANTS.PRICING.PLAN_NAMES.BRONZE;

  const isRuleCurrentlyActive = () => {
    return currentlySelectedRuleData.status === GLOBAL_CONSTANTS.RULE_STATUS.ACTIVE;
  };

  const changeRuleStatus = (newValue) => {
    if (newValue !== currentlySelectedRuleData.status)
      setCurrentlySelectedRule(dispatch, {
        ...currentlySelectedRuleData,
        status: newValue,
      });

    const isCreateMode = location.pathname.indexOf("create") !== -1;

    !isCreateMode &&
      StorageService(appMode)
        .saveRuleOrGroup(
          {
            ...currentlySelectedRuleData,
            status: newValue,
          },
          false
        )
        .then(() =>
          newValue === GLOBAL_CONSTANTS.RULE_STATUS.ACTIVE
            ? toast.success("Rule saved and activated")
            : toast.success("Rule saved and deactivated")
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
  }, [allRules, stableChangeRuleStatus, user, location.pathname, hasUserTriedToChangeRuleStatus, planNameFromState]);

  useEffect(() => {
    if (
      location.pathname.indexOf("create") === -1 &&
      !userAttributes?.num_rules &&
      !isMiscTourCompleted?.firstRule &&
      groupingAndRuleActivationExp === "variant1"
    ) {
      setStartWalkthrough(true);
    }
  }, [location.pathname, userAttributes?.num_rules, isMiscTourCompleted?.firstRule, groupingAndRuleActivationExp]);

  const isChecked = isRuleCurrentlyActive();

  return (
    <>
      <ProductWalkthrough
        tourFor={MISC_TOURS.APP_ENGAGEMENT.FIRST_RULE}
        startWalkthrough={startWalkthrough}
        onTourComplete={() =>
          dispatch(actions.updateProductTourCompleted({ tour: TOUR_TYPES.MISCELLANEOUS, subTour: "firstRule" }))
        }
      />
      <div className="display-row-center ml-2 rule-editor-header-switch" data-tour-id="rule-editor-status-toggle">
        <span className="rule-editor-header-switch-text text-gray">{isChecked ? "Enabled" : "Disabled"}</span>
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
              location.pathname.indexOf("create") !== -1 ? "create" : "edit",
              isRuleEditorModal ? "rule_editor_modal_header" : "rule_editor_screen_header"
            );
          }}
        />
      </div>
    </>
  );
};

export default Status;
