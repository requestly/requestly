import React from "react";
import RequestSourceRow from "../Rows/RowsMarkup/RequestSourceRow";
import { Row, Col, Space, Button } from "antd";
import { Rule, RuleType } from "types";
import {
  getEmptyPairUsingRuleType,
  getNewRule,
  setCurrentlySelectedRule,
} from "components/features/rules/RuleBuilder/actions";
import { useDispatch, useSelector } from "react-redux";
import { getAppMode, getCurrentlySelectedRuleData } from "store/selectors";
import { rulePairComponents } from "..";
import RULE_TYPES_CONFIG from "config/constants/sub/rule-types";
import { RQDropdown } from "lib/design-system/components";
import { CloseOutlined } from "@ant-design/icons";
import { omit } from "lodash";
import { deleteRulesFromStorage } from "components/features/rules/DeleteRulesModal/actions";

/**
 *
 *
 *
 * - before saving the super rule add the foreign key ie superRuleId, [DONE]
 *    - in all its child rules [DONE]
 *    - hide all the superRules child rules in rules table [DONE]
 *
 * HERE
 * - have a dropdown, on select push the new rule into the super rule [DONE]
 * - render the superRule rules [DONE]
 * - test the modification done in each of rule [DONE]
 *    - It will fail, fix state updates
 *    - Fix style [DONE]
 *
 * - render super rule in rules table [DONE]
 * - fix save super rule click [DONE]
 * - "Test this rule" testing [DONE]
 * - Bugs:
 *     - headers rule not working
 * - sync status of each rule with the super rule [DONE]
 *    - bug from editor action
 * - fix delete rules [DONE]
 * - hide the source URL row from the rule pairs [DONE]
 * - test working of rule
 * - add drag and drop for rearrangement of rules
 * - then work on priority of rules

 * - for pair add the rule pair in super rule pair only [DONE]
 *
 *  - RedirectRulePair [DONE]
 *  - CancelRulePair [DONE]
 *  - ReplaceRulePair [DONE]
 *  - HeadersRulePair [DONE]
 *  - ResponseRulePair [DONE]
 *  - UserAgentRulePair [DONE]
 *  - QueryParamRulePair
 *  - ScriptRulePair
 *  - RequestRulePair
 *  - DelayRulePair
 */

const SuperRulePair: React.FC<{
  pair: number;
  pairIndex: number;
  ruleDetails: Record<string, unknown>;
  isInputDisabled: boolean;
}> = ({ ...props }) => {
  const { pair, pairIndex, ruleDetails, isInputDisabled } = props;

  const dispatch = useDispatch();
  const appMode = useSelector(getAppMode);
  const currentlySelectedRuleData = useSelector(getCurrentlySelectedRuleData);

  const ruleTypes = Object.entries(RuleType)
    .filter(([key, label]) => label !== RuleType.SUPER)
    .map(([key, label]) => ({
      key,
      label,
      onClick: () => {
        const newRule = getNewRule(label);

        setCurrentlySelectedRule(
          dispatch,
          {
            ...currentlySelectedRuleData,
            pairs: [
              { ...currentlySelectedRuleData.pairs[0], [newRule.id]: getEmptyPairUsingRuleType(newRule.ruleType) },
            ],
            rules: {
              ...(currentlySelectedRuleData.rules ?? {}),
              [newRule.id]: { ...newRule, superRuleId: currentlySelectedRuleData.id },
            },
          },
          true
        );
      },
    }));

  const removeRule = async (ruleId: string) => {
    await deleteRulesFromStorage(appMode, [ruleId]);

    setCurrentlySelectedRule(
      dispatch,
      {
        ...currentlySelectedRuleData,
        pairs: [{ ...omit(currentlySelectedRuleData.pairs[0], [ruleId]) }],
        rules: omit(currentlySelectedRuleData?.rules ?? {}, [ruleId]),
      },
      true
    );
  };

  console.log({ superRule: currentlySelectedRuleData });

  const getRulesMarkup = () => {
    const markup = Object.values(currentlySelectedRuleData?.rules ?? {})?.map((rule: Rule) => {
      // const updatedRule = {
      //   ...rule,
      //   name: currentlySelectedRuleData.name,
      //   status: currentlySelectedRuleData.status,
      //   pairs: [
      //     {
      //       ...currentlySelectedRuleData.pairs?.[0]?.[rule.id],
      //     },
      //   ],
      // };

      const commonProps = {
        // pair: currentlySelectedRuleData?.rules?.[rule.id]?.pairs?.[0],
        pair: currentlySelectedRuleData.pairs?.[0]?.[rule.id],
        pairIndex: 0,
        ruleDetails: RULE_TYPES_CONFIG[rule.ruleType],
        isInputDisabled: false,
        isSuperRule: true,
        ruleId: rule.id,
      };

      const Component = rulePairComponents[rule.ruleType];

      return (
        <div key={rule?.id} style={{ display: "flex", gap: "4px", flexWrap: "nowrap" }}>
          {/* @ts-ignore */}
          <div style={{ flexGrow: "1" }}>
            <Component {...commonProps} />
          </div>
          <Button
            size="small"
            type="text"
            title={`Remove ${rule.ruleType.toLowerCase()} rule`}
            icon={<CloseOutlined width={12} height={12} />}
            onClick={() => removeRule(rule.id)}
            style={{
              alignSelf: "flex-start",
              flexShrink: "0",
              fontSize: "12px",
              padding: "4px",
              marginTop: [RuleType.CANCEL].includes(rule.ruleType) ? "0" : "1rem",
            }}
          />
        </div>
      );
    });

    return markup;
  };

  return (
    <>
      <Row>
        <Col span={24}>
          <RequestSourceRow
            rowIndex={1}
            pair={pair}
            pairIndex={pairIndex}
            ruleDetails={ruleDetails}
            isInputDisabled={isInputDisabled}
          />
        </Col>
      </Row>

      <Row>
        <Space direction="vertical" size={0} style={{ display: "flex", marginTop: "1rem", width: "100%" }}>
          <div style={{ marginLeft: "auto", marginRight: "21px", maxWidth: "150px" }}>
            <RQDropdown trigger={["click"]} menu={{ items: ruleTypes }}>
              <div
                style={{
                  cursor: "pointer",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  border: "1px solid var(--border-dark)",
                }}
              >
                Add rule conditions
              </div>
            </RQDropdown>
          </div>

          <Space direction="vertical" size={16} style={{ display: "flex", marginTop: "1rem", width: "100%" }}>
            {getRulesMarkup()}
          </Space>
        </Space>
      </Row>
    </>
  );
};

export default SuperRulePair;
