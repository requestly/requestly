import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Col } from "antd";
import { Modal } from "antd";
import CreatableReactSelect from "react-select/creatable";
import { toast } from "utils/Toast.js";
//EXTERNALS
import { StorageService } from "../../../../init";
//CONSTANTS
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
//REDUCER ACTIONS
import { actions } from "../../../../store";
import {
  getAllGroups,
  getAppMode,
  getCurrentlySelectedRuleData,
  getIsRefreshRulesPending,
  getRulesSelection,
  getUserAuthDetails,
} from "store/selectors";
//ACTIONS
import { updateGroupOfSelectedRules, createNewGroup } from "./actions";
import { unselectAllRules } from "../actions";
import { trackGroupChangedEvent } from "modules/analytics/events/common/groups";
import { setCurrentlySelectedRule } from "../RuleBuilder/actions";
import Logger from "lib/logger";

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
  const selectedRules = useSelector(getRulesSelection);
  const allGroups = useSelector(getAllGroups);
  const isRulesListRefreshPending = useSelector(getIsRefreshRulesPending);
  const appMode = useSelector(getAppMode);

  //Component State
  const [allOptionsForReactSelect, setAllOptionsForReactSelect] = useState([]);
  const [currentValueForReactSelect, setCurrentValueForReactSelect] = useState(
    []
  );

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
      return allOptions.filter(
        (option) => option.value === currentlySelectedRuleData.groupId
      );
    }
  };
  const stableGetCurrentValueForReactSelect = useCallback(
    getCurrentValueForReactSelect,
    [MODE, MODES.SELECTED_RULES, currentlySelectedRuleData.groupId]
  );

  const updateCurrentlySelectedRuleGroup = (newGroupId) => {
    if (MODE === MODES.CURRENT_RULE) {
      const updatedRule = { ...currentlySelectedRuleData, groupId: newGroupId };
      setCurrentlySelectedRule(dispatch, updatedRule);
    } else {
      updateGroupOfSelectedRules(appMode, selectedRules, newGroupId, user)
        .then(() => {
          trackGroupChangedEvent("rules_table");

          //Unselect all rules
          unselectAllRules(dispatch);
          props.clearSearch?.();
          //Refresh List
          dispatch(
            actions.updateRefreshPendingStatus({
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
      ? createNewGroup(
          appMode,
          newSelectedOption.label,
          updateCurrentlySelectedRuleGroup,
          user
        )
      : updateCurrentlySelectedRuleGroup(newSelectedOption.value);
    props.toggle();
  };

  useEffect(() => {
    Logger.log("Reading storage in ChangeRuleGroupModal");
    StorageService(appMode)
      .getRecords(GLOBAL_CONSTANTS.OBJECT_TYPES.GROUP)
      .then((groups) => {
        dispatch(actions.updateGroups(groups));
      });
  }, [dispatch, currentlySelectedRuleData, appMode]);

  useEffect(() => {
    setAllOptionsForReactSelect(generateOptionsForReactSelect(allGroups));
  }, [allGroups]);
  useEffect(() => {
    setCurrentValueForReactSelect(
      stableGetCurrentValueForReactSelect(allOptionsForReactSelect)
    );
  }, [
    setCurrentValueForReactSelect,
    stableGetCurrentValueForReactSelect,
    allOptionsForReactSelect,
  ]);

  return (
    <Modal
      visible={props.isOpen}
      onCancel={props.toggle}
      footer={null}
      title="Change Group"
    >
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
