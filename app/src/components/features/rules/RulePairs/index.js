import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Collapse, Tooltip } from "antd";
//Sub Components
import Filters from "./Filters";
// Pair markups of all rule types
import RedirectRulePair from "./Pairs/RedirectRulePair";
import CancelRulePair from "./Pairs/CancelRulePair";
import HeadersRulePair from "./Pairs/HeadersRulePair";
import ReplaceRulePair from "./Pairs/ReplaceRulePair";
import QueryParamRulePair from "./Pairs/QueryParamRulePair";
import ScriptRulePair from "./Pairs/ScriptRulePair";
import ResponseRulePair from "./Pairs/ResponseRulePair";
import UserAgentRulePair from "./Pairs/UserAgentRulePair";
import DelayRulePair from "./Pairs/DelayRulePair";
import RequestRulePair from "./Pairs/RequestRulePair";
//ACTIONS
import { addEmptyPair } from "../RuleBuilder/Body/Columns/AddPairButton/actions";
//EXTERNALS
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
//UTILITIES
import { getCurrentlySelectedRuleData } from "../../../../store/selectors";
import { trackRuleFilterModalToggled } from "modules/analytics/events/common/rules/filters";
import { FaTrash } from "react-icons/fa";
import { setCurrentlySelectedRule } from "../RuleBuilder/actions";
import ResponseRuleResourceTypes from "./ResponseRuleResourceTypes";
import {
  sourceRuleOperatorPlaceholders,
  destinationRuleOperatorPlaceholders,
} from "./utils";
import "./RulePairs.css";

const set = require("lodash/set");
const get = require("lodash/get");

const generatePlaceholderText = (operator, type, sourceKey = "") => {
  if (type === "source-value") {
    return sourceRuleOperatorPlaceholders[sourceKey]?.[operator];
  } else if (type === "destination") {
    return destinationRuleOperatorPlaceholders[operator];
  }

  return "";
};

export const getFilterObjectPath = (objectPath, filterIndex = 0) => {
  if (!objectPath.includes("filters")) {
    return objectPath;
  }
  const splitObjectPath = objectPath.split(".");
  splitObjectPath[1] = splitObjectPath[1] + `[${filterIndex}]`;
  return splitObjectPath.join(".");
};

const RulePairs = (props) => {
  //Global State
  const dispatch = useDispatch();
  const currentlySelectedRuleData = useSelector(getCurrentlySelectedRuleData);

  const isInputDisabled = props.mode === "shared-list-rule-view" ? true : false;

  //Component State
  const [
    ruleFilterActiveWithPairIndex,
    setRuleFilterActiveWithPairIndex,
  ] = useState(false);
  const [responseRuleResourceType, setResponseRuleResourceType] = useState("");

  /**
   * Handles onChange event with side effects
   * Here, path is relative to a pair
   * @param {Object|null|undefined} event onClick/onChange Event
   * @param {!number} pairIndex Index of array "pairs"
   * @param {!string} objectPath Path of item which we want to modify
   * @param {*} customValue If customValue is defined, use it instead of event target value
   * @param {array|undefined} arrayOfOtherValuesToModify Do other side effect modifications. Ex: [{path: "path_here",value:"value_to_be_placed"}]
   */
  const modifyPairAtGivenPath = (
    event,
    pairIndex,
    objectPath,
    customValue,
    arrayOfOtherValuesToModify,
    triggerUnsavedChangesIndication = true
  ) => {
    event?.preventDefault?.();

    const newValue =
      customValue !== undefined ? customValue : event.target.value;

    const copyOfCurrentlySelectedRule = JSON.parse(
      JSON.stringify(currentlySelectedRuleData)
    );
    set(
      copyOfCurrentlySelectedRule.pairs[pairIndex],
      getFilterObjectPath(objectPath),
      newValue
    );
    if (arrayOfOtherValuesToModify) {
      arrayOfOtherValuesToModify.forEach((modification) => {
        set(
          copyOfCurrentlySelectedRule.pairs[pairIndex],
          modification.path,
          modification.value
        );
      });
    }

    setCurrentlySelectedRule(
      dispatch,
      copyOfCurrentlySelectedRule,
      triggerUnsavedChangesIndication
    );
  };

  const getPairMarkup = (pair, pairIndex) => {
    const helperFunctions = {
      modifyPairAtGivenPath: modifyPairAtGivenPath,
      generatePlaceholderText: generatePlaceholderText,
      openFilterModal: openFilterModal,
      deletePair: deletePair,
      getFilterCount: getFilterCount,
      pushValueToArrayInPair: pushValueToArrayInPair,
      deleteArrayValueByIndexInPair: deleteArrayValueByIndexInPair,
    };

    switch (props.currentlySelectedRuleConfig.TYPE) {
      case GLOBAL_CONSTANTS.RULE_TYPES.REDIRECT:
        return (
          <RedirectRulePair
            pair={pair}
            pairIndex={pairIndex}
            helperFunctions={helperFunctions}
            ruleDetails={props.currentlySelectedRuleConfig}
            isInputDisabled={isInputDisabled}
          />
        );
      case GLOBAL_CONSTANTS.RULE_TYPES.CANCEL:
        return (
          <CancelRulePair
            pair={pair}
            pairIndex={pairIndex}
            helperFunctions={helperFunctions}
            ruleDetails={props.currentlySelectedRuleConfig}
            isInputDisabled={isInputDisabled}
          />
        );
      case GLOBAL_CONSTANTS.RULE_TYPES.REPLACE:
        return (
          <ReplaceRulePair
            pair={pair}
            pairIndex={pairIndex}
            helperFunctions={helperFunctions}
            ruleDetails={props.currentlySelectedRuleConfig}
            isInputDisabled={isInputDisabled}
          />
        );
      case GLOBAL_CONSTANTS.RULE_TYPES.HEADERS:
        return (
          <HeadersRulePair
            pair={pair}
            pairIndex={pairIndex}
            helperFunctions={helperFunctions}
            ruleDetails={props.currentlySelectedRuleConfig}
            isInputDisabled={isInputDisabled}
          />
        );
      case GLOBAL_CONSTANTS.RULE_TYPES.QUERYPARAM:
        return (
          <QueryParamRulePair
            pair={pair}
            pairIndex={pairIndex}
            helperFunctions={helperFunctions}
            ruleDetails={props.currentlySelectedRuleConfig}
            isInputDisabled={isInputDisabled}
          />
        );
      case GLOBAL_CONSTANTS.RULE_TYPES.SCRIPT:
        return (
          <ScriptRulePair
            pair={pair}
            pairIndex={pairIndex}
            helperFunctions={helperFunctions}
            ruleDetails={props.currentlySelectedRuleConfig}
            isInputDisabled={isInputDisabled}
          />
        );
      case GLOBAL_CONSTANTS.RULE_TYPES.RESPONSE:
        return (
          <ResponseRulePair
            pair={pair}
            pairIndex={pairIndex}
            helperFunctions={helperFunctions}
            ruleDetails={props.currentlySelectedRuleConfig}
            isInputDisabled={isInputDisabled}
            responseRuleResourceType={responseRuleResourceType}
          />
        );
      case GLOBAL_CONSTANTS.RULE_TYPES.REQUEST:
        return (
          <RequestRulePair
            pair={pair}
            pairIndex={pairIndex}
            helperFunctions={helperFunctions}
            ruleDetails={props.currentlySelectedRuleConfig}
            isInputDisabled={isInputDisabled}
          />
        );
      case GLOBAL_CONSTANTS.RULE_TYPES.USERAGENT:
        return (
          <UserAgentRulePair
            pair={pair}
            pairIndex={pairIndex}
            helperFunctions={helperFunctions}
            ruleDetails={props.currentlySelectedRuleConfig}
            isInputDisabled={isInputDisabled}
          />
        );
      case GLOBAL_CONSTANTS.RULE_TYPES.DELAY:
        return (
          <DelayRulePair
            pair={pair}
            pairIndex={pairIndex}
            helperFunctions={helperFunctions}
            ruleDetails={props.currentlySelectedRuleConfig}
            isInputDisabled={isInputDisabled}
          />
        );

      default:
        break;
    }
  };

  const deletePair = (event, pairIndex) => {
    event?.preventDefault();

    const copyOfCurrentlySelectedRule = JSON.parse(
      JSON.stringify(currentlySelectedRuleData)
    );

    copyOfCurrentlySelectedRule.pairs.splice(pairIndex, 1);
    setCurrentlySelectedRule(dispatch, copyOfCurrentlySelectedRule, true);
  };

  const migrateToNewSourceFilterFormat = (
    pairIndex,
    copyOfCurrentlySelectedRule
  ) => {
    copyOfCurrentlySelectedRule.pairs[pairIndex].source.filters = [
      copyOfCurrentlySelectedRule.pairs[pairIndex].source.filters,
    ];
    setCurrentlySelectedRule(dispatch, copyOfCurrentlySelectedRule);
  };

  let isSourceFilterFormatUpgraded = (
    pairIndex,
    copyOfCurrentlySelectedRule
  ) => {
    return Array.isArray(
      copyOfCurrentlySelectedRule.pairs[pairIndex].source.filters
    )
      ? true
      : false;
  };

  const openFilterModal = (pairIndex) => {
    const copyOfCurrentlySelectedRule = JSON.parse(
      JSON.stringify(currentlySelectedRuleData)
    );
    if (!isSourceFilterFormatUpgraded(pairIndex, copyOfCurrentlySelectedRule)) {
      migrateToNewSourceFilterFormat(pairIndex, copyOfCurrentlySelectedRule);
    }
    setRuleFilterActiveWithPairIndex(pairIndex);
    trackRuleFilterModalToggled(true, currentlySelectedRuleData?.ruleType);
  };

  const closeFilterModal = () => {
    setRuleFilterActiveWithPairIndex(false);
    trackRuleFilterModalToggled(false, currentlySelectedRuleData?.ruleType);
  };

  const getFilterCount = (pairIndex) => {
    const copyOfCurrentlySelectedRule = JSON.parse(
      JSON.stringify(currentlySelectedRuleData)
    );
    return isSourceFilterFormatUpgraded(pairIndex, copyOfCurrentlySelectedRule)
      ? Object.keys(
          currentlySelectedRuleData.pairs[pairIndex].source.filters[0] || {}
        ).length
      : Object.keys(
          currentlySelectedRuleData.pairs[pairIndex].source.filters || {}
        ).length;
  };

  const pushValueToArrayInPair = (event, pairIndex, arrayPath, value) => {
    event && event.preventDefault();
    const copyOfCurrentlySelectedRule = JSON.parse(
      JSON.stringify(currentlySelectedRuleData)
    );
    const targetArray = get(
      copyOfCurrentlySelectedRule.pairs[pairIndex],
      arrayPath
    );
    set(copyOfCurrentlySelectedRule.pairs[pairIndex], arrayPath, [
      ...(targetArray || []),
      value,
    ]);
    setCurrentlySelectedRule(dispatch, copyOfCurrentlySelectedRule, true);
  };

  const deleteArrayValueByIndexInPair = (
    event,
    pairIndex,
    arrayPath,
    arrayIndex
  ) => {
    event && event.preventDefault();
    const copyOfCurrentlySelectedRule = JSON.parse(
      JSON.stringify(currentlySelectedRuleData)
    );
    get(copyOfCurrentlySelectedRule.pairs[pairIndex], arrayPath).splice(
      arrayIndex,
      1
    );
    setCurrentlySelectedRule(dispatch, copyOfCurrentlySelectedRule, true);
  };

  if (
    currentlySelectedRuleData.pairs &&
    currentlySelectedRuleData.pairs.length === 0
  ) {
    addEmptyPair(
      currentlySelectedRuleData,
      props.currentlySelectedRuleConfig,
      dispatch
    );
  }

  const deleteButton = (pairIndex) =>
    (props.currentlySelectedRuleConfig.TYPE === "Replace" &&
      !isInputDisabled) ||
    (props.currentlySelectedRuleConfig.SHOW_DELETE_PAIR_ICON_ON_SOURCE_ROW &&
      !isInputDisabled) ? (
      <Tooltip title="Remove Pair">
        <FaTrash
          className="delete-pair-icon cursor-pointer text-gray"
          onClick={(e) => deletePair(e, pairIndex)}
        />
      </Tooltip>
    ) : null;

  const getFirstFiveRuleIds = (rules = []) => {
    const ids = [];
    for (let i = 0; i < Math.min(rules.length, 5); i++) {
      ids.push(rules[i].id);
    }
    return ids;
  };

  const activePanelKey = getFirstFiveRuleIds(currentlySelectedRuleData?.pairs);
  const rulePairHeading =
    currentlySelectedRuleData?.ruleType === "Script" ? "If page" : "If request";

  return (
    <>
      {props.currentlySelectedRuleConfig.TYPE === "Response" ? (
        <ResponseRuleResourceTypes
          currentlySelectedRuleData={currentlySelectedRuleData}
          responseRuleResourceType={responseRuleResourceType}
          setResponseRuleResourceType={setResponseRuleResourceType}
        />
      ) : null}

      {props.currentlySelectedRuleConfig.TYPE !== "Response" ||
      responseRuleResourceType !== "" ? (
        <Collapse
          className="rule-pairs-collapse"
          defaultActiveKey={activePanelKey}
          key={activePanelKey[activePanelKey.length - 1]}
        >
          {currentlySelectedRuleData?.pairs?.length > 0
            ? currentlySelectedRuleData.pairs.map((pair, pairIndex) => (
                <Collapse.Panel
                  key={pair.id || pairIndex}
                  className="rule-pairs-panel"
                  extra={deleteButton(pairIndex)}
                  header={
                    <span className="panel-header">{rulePairHeading}</span>
                  }
                >
                  {getPairMarkup(pair, pairIndex)}
                </Collapse.Panel>
              ))
            : null}

          {ruleFilterActiveWithPairIndex !== false ? (
            <Filters
              pairIndex={ruleFilterActiveWithPairIndex}
              closeModal={closeFilterModal}
              modifyPairAtGivenPath={modifyPairAtGivenPath}
              isInputDisabled={isInputDisabled}
            />
          ) : null}
        </Collapse>
      ) : null}
    </>
  );
};

export default RulePairs;
