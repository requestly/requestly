import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Col } from "antd";
import { Modal } from "antd";
import CreatableReactSelect from "react-select/creatable";
import { toast } from "utils/Toast.js";
//CONSTANTS
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/constants";
//REDUCER ACTIONS
import { globalActions } from "store/slices/global/slice";
import { getAllGroups, getAppMode, getCurrentlySelectedRuleData, getIsRefreshRulesPending } from "store/selectors";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
//ACTIONS
import { updateGroupOfSelectedRules, createNewGroup } from "./actions";
import { trackGroupChangedEvent } from "features/rules/analytics";
import { setCurrentlySelectedRule } from "../RuleBuilder/actions";
import Logger from "lib/logger";
import { RecordType } from "@requestly/shared/types/entities/rules";
import clientRuleStorageService from "services/clientStorageService/features/rule";

const ChangeRuleGroupModal = (props) => {
  //Accepted Modes
  //CURRENT_RULE -> To modify single currently selected rule (in the Rule Editor)
  //SELECTED_RULES -> To modify multiple selected rules in Rules List
  const MODE = props.mode;
  const MODES = {};
  MODES.CURRENT_RULE = "CURRENT_RULE";
  MODES.SELECTED_RULES = "SELECTED_RULES";

  //Global State
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const currentlySelectedRuleData = useSelector(getCurrentlySelectedRuleData);
  const allGroups = useSelector(getAllGroups);
  const isRulesListRefreshPending = useSelector(getIsRefreshRulesPending);
  const appMode = useSelector(getAppMode);

  // TODO: Remove old rules table check after new table is rolled out to all users
  const selectedRuleIds = useMemo(
    () => (props.isOldRulesTable ? props.selectedRules : props.selectedRules.map((rule) => rule.id)),
    [props.isOldRulesTable, props.selectedRules]
  );

  //Component State
  const [allOptionsForReactSelect, setAllOptionsForReactSelect] = useState([]);
  const [currentValueForReactSelect, setCurrentValueForReactSelect] = useState([]);

  const generateOptionsForReactSelect = (groups) => {
    return groups.map((group) => {
      return {
        label: group.name,
        value: group.id,
      };
    });
  };

  const getCurrentValueForReactSelect = (allOptions) => {
    if (MODE === MODES.SELECTED_RULES) {
      return [];
    } else {
      return allOptions.filter((option) => option.value === currentlySelectedRuleData?.groupId);
    }
  };

  const stableGetCurrentValueForReactSelect = useCallback(getCurrentValueForReactSelect, [
    MODE,
    MODES.SELECTED_RULES,
    currentlySelectedRuleData.groupId,
  ]);

  const updateCurrentlySelectedRuleGroup = (newGroupId) => {
    if (MODE === MODES.CURRENT_RULE) {
      const updatedRule = { ...currentlySelectedRuleData, groupId: newGroupId };
      setCurrentlySelectedRule(dispatch, updatedRule);
    } else {
      updateGroupOfSelectedRules(appMode, selectedRuleIds, newGroupId, user)
        .then(() => {
          trackGroupChangedEvent("rules_list");
          toast.success(`${selectedRuleIds?.length > 1 ? "Rules" : "Rule"} moved to group successfully!`);
          // dispatch(globalActions.clearSelectedRecords());
          props.onGroupChanged?.();
          props.clearSearch?.();
          //Refresh List
          dispatch(
            globalActions.updateRefreshPendingStatus({
              type: "rules",
              newValue: !isRulesListRefreshPending,
            })
          );
        })
        .catch(() => {
          toast.warn("Please select the rules first", {
            hideProgressBar: true,
          });
        });
    }
  };

  const handleReactSelectOnChange = (newSelectedOption) => {
    newSelectedOption.__isNew__
      ? createNewGroup(appMode, newSelectedOption.label, updateCurrentlySelectedRuleGroup, user)
      : updateCurrentlySelectedRuleGroup(newSelectedOption.value);
    props.toggle();
  };

  useEffect(() => {
    Logger.log("Reading storage in ChangeRuleGroupModal");
    clientRuleStorageService.getRecordsByObjectType(RecordType.GROUP).then((groups) => {
      dispatch(globalActions.updateGroups(groups));
    });
  }, [dispatch, currentlySelectedRuleData, appMode]);

  useEffect(() => {
    setAllOptionsForReactSelect(generateOptionsForReactSelect(allGroups));
  }, [allGroups]);

  useEffect(() => {
    setCurrentValueForReactSelect(stableGetCurrentValueForReactSelect(allOptionsForReactSelect));
  }, [setCurrentValueForReactSelect, stableGetCurrentValueForReactSelect, allOptionsForReactSelect]);

  return (
    <Modal open={props.isOpen} onCancel={props.toggle} footer={null} title="Change Group">
      <div className="">
        {/* <Row className="one-padding-bottom  my-auto"> */}
        <Col className="my-auto">
          <span>Select new group</span>
        </Col>
        <br />
        <Col className="my-auto" style={{ fontSize: "0.9em" }}>
          <CreatableReactSelect
            isMulti={false}
            name="select-group"
            options={allOptionsForReactSelect}
            placeholder="Select or Type"
            theme={(theme) => ({
              ...theme,
              borderRadius: 4,
              colors: {
                ...theme.colors,
                primary: "#141414",
                primary25: "#2b2b2b",
                neutral0: "#141414",
              },
            })}
            value={currentValueForReactSelect}
            onChange={handleReactSelectOnChange}
          />
        </Col>
        {/* </Row> */}
      </div>
    </Modal>
  );
};

export default ChangeRuleGroupModal;
