import React from "react";
import { Row, Col } from "antd";
import RequestSourceRow from "../Rows/RowsMarkup/RequestSourceRow";
import RequestBodyRow from "../Rows/RowsMarkup/RequestBodyRow";

const RequestRulePair = ({
  pair,
  pairIndex,
  helperFunctions,
  ruleDetails,
  isInputDisabled,
}) => {
  return (
    <React.Fragment>
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
          <RequestBodyRow
            rowIndex={2}
            pair={pair}
            pairIndex={pairIndex}
            helperFunctions={helperFunctions}
            ruleDetails={ruleDetails}
            isInputDisabled={isInputDisabled}
          />
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default RequestRulePair;
