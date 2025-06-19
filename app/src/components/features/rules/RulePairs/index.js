import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Collapse, Popconfirm, Tooltip } from "antd";
import { globalActions } from "store/slices/global/slice";
import { addEmptyPair } from "../RuleBuilder/Body/Columns/AddPairButton/actions";
import {
  getCurrentlySelectedRuleData,
  getRequestRuleResourceType,
  getResponseRuleResourceType,
} from "../../../../store/selectors";
import { FaTrash } from "@react-icons/all-files/fa/FaTrash";
import ResponseRuleResourceTypes from "./RequestResponseRuleResourceTypes";
import { rulePairComponents } from "./Pairs";
import { useRBAC } from "features/rbac";
import "./RulePairs.css";
import { RuleType } from "@requestly/shared/types/entities/rules";

const RulePairs = (props) => {
  const dispatch = useDispatch();
  const currentlySelectedRuleData = useSelector(getCurrentlySelectedRuleData);
  const ruleResourceType = useSelector(
    currentlySelectedRuleData.ruleType === "Response" ? getResponseRuleResourceType : getRequestRuleResourceType
  );
  const { validatePermission } = useRBAC();
  const { isValidPermission } = validatePermission("http_rule", "create");

  const isSampleRule = currentlySelectedRuleData?.isSample;
  const isInputDisabled = props.mode === "shared-list-rule-view" || !!isSampleRule || !isValidPermission;

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
    if (currentlySelectedRuleData.pairs && currentlySelectedRuleData.pairs.length === 0) {
      addEmptyPair(currentlySelectedRuleData, props.currentlySelectedRuleConfig, dispatch);
    }
  }, [dispatch, currentlySelectedRuleData, props.currentlySelectedRuleConfig]);

  const deleteButton = (pairIndex) => {
    if (pairIndex === 0) {
      return null;
    }
    return (props.currentlySelectedRuleConfig.TYPE === "Replace" && !isInputDisabled) ||
      (props.currentlySelectedRuleConfig.SHOW_DELETE_PAIR_ICON_ON_SOURCE_ROW && !isInputDisabled) ? (
      <Popconfirm
        placement="left"
        title="Are you sure you want to delete this rule pair?"
        onConfirm={() => dispatch(globalActions.removeRulePairByIndex({ pairIndex }))}
      >
        <Tooltip title="Remove Pair" placement="bottom" overlayClassName="rq-tooltip">
          <FaTrash
            className="delete-pair-icon cursor-pointer text-gray"
            onClick={(e) => {
              e.stopPropagation();
            }}
          />
        </Tooltip>
      </Popconfirm>
    ) : null;
  };

  const getFirstFiveRuleIds = (rules = []) => {
    const ids = [];
    for (let i = 0; i < Math.min(rules.length, 5); i++) {
      ids.push(rules[i].id);
    }
    return ids;
  };

  const activePanelKey = getFirstFiveRuleIds(currentlySelectedRuleData?.pairs);
  const rulePairHeading = currentlySelectedRuleData?.ruleType === "Script" ? "If page" : "If request";

  if ([RuleType.REQUEST, RuleType.RESPONSE].includes(props.currentlySelectedRuleConfig.TYPE) && !ruleResourceType) {
    return (
      <div className="rule-pairs-container">
        <ResponseRuleResourceTypes disabled={isInputDisabled} ruleDetails={props.currentlySelectedRuleConfig} />
      </div>
    );
  }

  return (
    <>
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
    </>
  );
};

export default RulePairs;
