import React from "react";
import { Row } from "antd";
//CONSTANTS
import HeadersRulePairV2 from "../../../HeadersRulePair/HeadersRulePairV2";

const ModifyHeaderRow = ({ rowIndex, pair, pairIndex, isInputDisabled, ruleDetails }) => {
  return (
    <Row span={24} gutter={8} key={rowIndex} align="middle" className="margin-top-one">
      <HeadersRulePairV2
        pair={pair}
        pairIndex={pairIndex}
        isInputDisabled={isInputDisabled}
        ruleDetails={ruleDetails}
      />
    </Row>
  );
};

export default ModifyHeaderRow;
