import React from "react";
import DestinationURLRow from "../Rows/RowsMarkup/DestinationURLRow";
import RequestSourceRow from "../Rows/RowsMarkup/RequestSourceRow";
import { Row, Col } from "antd";

const RedirectRulePair = ({ pair, pairIndex, ruleDetails, isInputDisabled }) => {
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
        <Col span={24}>
          <DestinationURLRow rowIndex={2} pair={pair} pairIndex={pairIndex} isInputDisabled={isInputDisabled} />
        </Col>
      </Row>
    </>
  );
};

export default RedirectRulePair;
