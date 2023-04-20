import React from "react";
import ReplacePartRow from "../Rows/RowsMarkup/ReplacePartRow";
import RequestSourceRow from "../Rows/RowsMarkup/RequestSourceRow";
import { Row, Col } from "antd";

const ReplaceRulePair = ({ pair, pairIndex, helperFunctions, ruleDetails, isInputDisabled }) => (
  <React.Fragment>
    <Row align="middle">
      <Col span={24}>
        <RequestSourceRow
          rowIndex={2}
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
        <ReplacePartRow
          rowIndex={1}
          pair={pair}
          pairIndex={pairIndex}
          helperFunctions={helperFunctions}
          isInputDisabled={isInputDisabled}
        />
      </Col>
    </Row>
  </React.Fragment>
);

export default ReplaceRulePair;
