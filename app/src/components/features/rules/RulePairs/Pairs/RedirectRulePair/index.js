import React from "react";
import DestinationURLRow from "../Rows/RowsMarkup/DestinationURLRow";
import RequestSourceRow from "../Rows/RowsMarkup/RequestSourceRow";
import { Row, Col } from "antd";

const RedirectRulePair = ({ pair, pairIndex, helperFunctions, ruleDetails, isInputDisabled }) => {
  return (
    <>
      <Row>
        <Col span={24}>
          <RequestSourceRow
            rowIndex={1}
            pair={pair}
            pairIndex={pairIndex}
            helperFunctions={helperFunctions}
            ruleDetails={ruleDetails}
            isInputDisabled={isInputDisabled}
          />
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <DestinationURLRow
            rowIndex={2}
            pair={pair}
            pairIndex={pairIndex}
            helperFunctions={helperFunctions}
            isInputDisabled={isInputDisabled}
          />
        </Col>
      </Row>
    </>
  );
};

export default RedirectRulePair;
