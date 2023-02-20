import React from "react";
import ModifyHeaderRow from "../Rows/RowsMarkup/ModifyHeaderRow";
import RequestSourceRow from "../Rows/RowsMarkup/RequestSourceRow";
import { Row, Col } from "antd";

const HeadersRulePair = ({
  pair,
  pairIndex,
  helperFunctions,
  ruleDetails,
  isInputDisabled,
}) => (
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
        <ModifyHeaderRow
          rowIndex={1}
          pair={pair}
          pairIndex={pairIndex}
          helperFunctions={helperFunctions}
          isInputDisabled={isInputDisabled}
          ruleDetails={ruleDetails}
        />
      </Col>
    </Row>
  </React.Fragment>
);

export default HeadersRulePair;
