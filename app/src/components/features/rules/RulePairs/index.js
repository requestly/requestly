import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Collapse, Tooltip } from "antd";
import Filters from "./Filters";
import { actions } from "store";
import { addEmptyPair } from "../RuleBuilder/Body/Columns/AddPairButton/actions";
import { getCurrentlySelectedRuleData, getResponseRuleResourceType } from "../../../../store/selectors";
import { trackRuleFilterModalToggled } from "modules/analytics/events/common/rules/filters";
import { FaTrash } from "react-icons/fa";
import { setCurrentlySelectedRule } from "../RuleBuilder/actions";
import ResponseRuleResourceTypes from "./ResponseRuleResourceTypes";
import { sourceRuleOperatorPlaceholders, destinationRuleOperatorPlaceholders } from "./utils";
import { rulePairComponents } from "./Pairs";
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

const RulePairs = (props) => {
  //Global State
  const dispatch = useDispatch();
  const currentlySelectedRuleData = useSelector(getCurrentlySelectedRuleData);
  const responseRuleResourceType = useSelector(getResponseRuleResourceType);

  const isInputDisabled = props.mode === "shared-list-rule-view" ? true : false;

  //Component State
  const [ruleFilterActiveWithPairIndex, setRuleFilterActiveWithPairIndex] = useState(false);

  const getPairMarkup = (pair, pairIndex) => {
    const helperFunctions = {
      generatePlaceholderText: generatePlaceholderText,
      openFilterModal: openFilterModal,
      getFilterCount: getFilterCount,
      pushValueToArrayInPair: pushValueToArrayInPair,
    };

    const commonProps = {
      pair: pair,
      pairIndex: pairIndex,
      helperFunctions: helperFunctions,
      ruleDetails: props.currentlySelectedRuleConfig,
      isInputDisabled: isInputDisabled,
    };

    const Component = rulePairComponents[props.currentlySelectedRuleConfig.TYPE];
    return <Component {...commonProps} />;
  };

  const migrateToNewSourceFilterFormat = (pairIndex, copyOfCurrentlySelectedRule) => {
    copyOfCurrentlySelectedRule.pairs[pairIndex].source.filters = [
      copyOfCurrentlySelectedRule.pairs[pairIndex].source.filters,
    ];
    setCurrentlySelectedRule(dispatch, copyOfCurrentlySelectedRule);
  };

  let isSourceFilterFormatUpgraded = (pairIndex, copyOfCurrentlySelectedRule) => {
    return Array.isArray(copyOfCurrentlySelectedRule.pairs[pairIndex].source.filters) ? true : false;
  };

  const openFilterModal = (pairIndex) => {
    const copyOfCurrentlySelectedRule = JSON.parse(JSON.stringify(currentlySelectedRuleData));
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
    const copyOfCurrentlySelectedRule = JSON.parse(JSON.stringify(currentlySelectedRuleData));
    return isSourceFilterFormatUpgraded(pairIndex, copyOfCurrentlySelectedRule)
      ? Object.keys(currentlySelectedRuleData.pairs[pairIndex].source.filters[0] || {}).length
      : Object.keys(currentlySelectedRuleData.pairs[pairIndex].source.filters || {}).length;
  };

  const pushValueToArrayInPair = (event, pairIndex, arrayPath, value) => {
    event && event.preventDefault();
    const copyOfCurrentlySelectedRule = JSON.parse(JSON.stringify(currentlySelectedRuleData));
    const targetArray = get(copyOfCurrentlySelectedRule.pairs[pairIndex], arrayPath);
    set(copyOfCurrentlySelectedRule.pairs[pairIndex], arrayPath, [...(targetArray || []), value]);
    setCurrentlySelectedRule(dispatch, copyOfCurrentlySelectedRule, true);
  };

  if (currentlySelectedRuleData.pairs && currentlySelectedRuleData.pairs.length === 0) {
    addEmptyPair(currentlySelectedRuleData, props.currentlySelectedRuleConfig, dispatch);
  }

  const deleteButton = (pairIndex) =>
    (props.currentlySelectedRuleConfig.TYPE === "Replace" && !isInputDisabled) ||
    (props.currentlySelectedRuleConfig.SHOW_DELETE_PAIR_ICON_ON_SOURCE_ROW && !isInputDisabled) ? (
      <Tooltip title="Remove Pair">
        <FaTrash
          className="delete-pair-icon cursor-pointer text-gray"
          onClick={(e) => dispatch(actions.removeRulePairByIndex({ pairIndex }))}
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
  const rulePairHeading = currentlySelectedRuleData?.ruleType === "Script" ? "If page" : "If request";

  return (
    <>
      {props.currentlySelectedRuleConfig.TYPE === "Response" ? <ResponseRuleResourceTypes /> : null}

      {props.currentlySelectedRuleConfig.TYPE !== "Response" || responseRuleResourceType !== "" ? (
        <Collapse
          className="rule-pairs-collapse"
          defaultActiveKey={activePanelKey}
          key={activePanelKey[activePanelKey.length - 1]}
          expandIconPosition="end"
        >
          {currentlySelectedRuleData?.pairs?.length > 0
            ? currentlySelectedRuleData.pairs.map((pair, pairIndex) => (
                <Collapse.Panel
                  key={pair.id || pairIndex}
                  className="rule-pairs-panel"
                  extra={deleteButton(pairIndex)}
                  header={<span className="panel-header">{rulePairHeading}</span>}
                >
                  {getPairMarkup(pair, pairIndex)}
                </Collapse.Panel>
              ))
            : null}

          {ruleFilterActiveWithPairIndex !== false ? (
            <Filters
              pairIndex={ruleFilterActiveWithPairIndex}
              closeModal={closeFilterModal}
              isInputDisabled={isInputDisabled}
            />
          ) : null}
        </Collapse>
      ) : null}
    </>
  );
};

export default RulePairs;
