import React, { useState } from "react";
import RequestSourceRow from "../Rows/RowsMarkup/RequestSourceRow";
import { Row, Col, Space, Button } from "antd";
import { Rule, RuleType } from "types";
import {
  getEmptyPairUsingRuleType,
  getNewRule,
  setCurrentlySelectedRule,
} from "components/features/rules/RuleBuilder/actions";
import { useDispatch, useSelector } from "react-redux";
import { getAppMode, getCurrentlySelectedRuleConfig, getCurrentlySelectedRuleData } from "store/selectors";
import { rulePairComponents } from "..";
import RULE_TYPES_CONFIG from "config/constants/sub/rule-types";
import { RQDropdown } from "lib/design-system/components";
import { CloseOutlined } from "@ant-design/icons";
import { omit } from "lodash";

/**
 * - Make the index route and render an empty page [DONE]
 * - Put request source row component, check the states [DONE]
 * - render delay rules values and show an edit icon
 * - render modify response rule
 * - Can add drag and drop too for priority
 * - Can add audit logs too on how the rules have executed
 * - An option to add more rules to a super rule
 *
 *
 * - Create a new rule type called superRule
 *    - If its a super rule type then the changes will be: superRule.children[index_of_individual_rule]
 * - This will openin editor with some different UI
 * - This can also show the rules on listing page
 * - The above will make possible to create mutiple super rules
 * - update the currentlySelected rule data and config whenever this page loads
 *
 *
 * - before saving the super rule add the foreign key ie superRuleId,
 *    - in all its child rules
 *    - hide all the superRules child rules in rules table
 *
 * HERE
 * - have a dropdown, on select push the new rule into the super rule [DONE]
 * - render the superRule rules [DONE]
 * - test the modification done in each of rule
 *    - It will fail, fix state updates
 *    - Fix style
 *
 * - if working then:
 *    - fix save super rule click
 *    - hide the source URL row from the rule pairs
 *    - test
 *    - add drag and drop for rearrangement of rules
 *      - then work on priority of rules
 * - if not working: debug,
 *
 * - for pair add the rule pair in super rule pair only
 *
 * Bugs:
 * - deletion of rule paire will break
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
  const currentlySelectedRuleConfig = useSelector(getCurrentlySelectedRuleConfig);
  const currentlySelectedRuleData = useSelector(getCurrentlySelectedRuleData);
  const [ruleType, setRuleType] = useState<RuleType>();

  const ruleTypes = Object.entries(RuleType)
    .filter(([key, label]) => label !== RuleType.SUPER)
    .map(([key, label]) => ({
      key,
      label,
      onClick: () => {
        const newRule = getNewRule(label);

        setRuleType(label);

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
    // await deleteRulesFromStorage(appMode, [ruleId], () => {
    //   toast.info(`Rules deleted permanently!`);
    // });

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

  console.log({ pairs: currentlySelectedRuleData.pairs });

  const getRulesMarkup = () => {
    const markup = Object.values(currentlySelectedRuleData?.rules ?? {})?.map((rule: Rule) => {
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
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <Button
            title="Remove"
            icon={<CloseOutlined width={12} height={12} />}
            danger
            onClick={() => removeRule(rule.id)}
            style={{ alignSelf: "flex-end", marginRight: "21px", fontSize: "12px", padding: "4px" }}
          />
          {/* @ts-ignore */}
          <Component key={rule?.id} {...commonProps} />
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
        <Space direction="vertical" size="middle" style={{ display: "flex", marginTop: "1rem", width: "100%" }}>
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

          <Space direction="vertical" size={[24, 24]} style={{ display: "flex", marginTop: "1rem", width: "100%" }}>
            {getRulesMarkup()}
          </Space>
        </Space>
      </Row>
    </>
  );
};

export default SuperRulePair;
