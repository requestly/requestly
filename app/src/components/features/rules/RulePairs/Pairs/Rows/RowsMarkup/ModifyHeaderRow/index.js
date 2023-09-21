import React from "react";
import { useSelector } from "react-redux";
import { Row } from "antd";
//CONSTANTS
import HeadersRulePairV2 from "../../../HeadersRulePair/HeadersRulePairV2";
import HeadersRulePairV1 from "../../../HeadersRulePair/HeadersRulePairV1";
import { getCurrentlySelectedRuleData } from "../../../../../../../../store/selectors";

const ModifyHeaderRow = ({ rowIndex, pair, pairIndex, isInputDisabled, ruleDetails }) => {
  const currentlySelectedRuleData = useSelector(getCurrentlySelectedRuleData);

  return (
    <Row span={24} gutter={8} key={rowIndex} align="middle" className="margin-top-one">
      {currentlySelectedRuleData.version > 1 ? (
        <HeadersRulePairV2
          pair={pair}
          pairIndex={pairIndex}
          isInputDisabled={isInputDisabled}
          ruleDetails={ruleDetails}
        />
      ) : (
        <HeadersRulePairV1 pair={pair} pairIndex={pairIndex} isInputDisabled={isInputDisabled} />
      )}
    </Row>
  );
};

export default ModifyHeaderRow;
