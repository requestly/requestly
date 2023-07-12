import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Collapse, Tooltip } from "antd";
import { actions } from "store";
import { addEmptyPair } from "../RuleBuilder/Body/Columns/AddPairButton/actions";
import { getCurrentlySelectedRuleData, getResponseRuleResourceType } from "../../../../store/selectors";
import { FaTrash } from "react-icons/fa";
import ResponseRuleResourceTypes from "./ResponseRuleResourceTypes";
import { rulePairComponents } from "./Pairs";
import "./RulePairs.css";

const RulePairs = (props) => {
  const dispatch = useDispatch();
  const currentlySelectedRuleData = useSelector(getCurrentlySelectedRuleData);
  const responseRuleResourceType = useSelector(getResponseRuleResourceType);
  const isInputDisabled = props.mode === "shared-list-rule-view" ? true : false;

  const getPairMarkup = (pair, pairIndex) => {
    const commonProps = {
      pair: pair,
      pairIndex: pairIndex,
      ruleDetails: props.currentlySelectedRuleConfig,
      isInputDisabled: isInputDisabled,
    };

    const Component = rulePairComponents[props.currentlySelectedRuleConfig.TYPE];
    return <Component {...commonProps} />;
  };

  useEffect(() => {
    console.log("running....");
    if (currentlySelectedRuleData.pairs && currentlySelectedRuleData.pairs.length === 0) {
      console.log("controlled running...");
      addEmptyPair(currentlySelectedRuleData, props.currentlySelectedRuleConfig, dispatch);
    }
  }, [dispatch, currentlySelectedRuleData, props.currentlySelectedRuleConfig]);

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
        </Collapse>
      ) : null}
    </>
  );
};

export default RulePairs;
