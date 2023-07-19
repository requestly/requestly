import React from "react";
import UserAgentSelectionRow from "../Rows/RowsMarkup/UserAgentSelectionRow";
import RequestSourceRow from "../Rows/RowsMarkup/RequestSourceRow";
import { Row, Col } from "antd";

const UserAgentRulePair = ({ pair, pairIndex, ruleDetails, isInputDisabled }) => {
  return (
    <React.Fragment>
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
          <UserAgentSelectionRow rowIndex={2} pair={pair} pairIndex={pairIndex} isInputDisabled={isInputDisabled} />
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default UserAgentRulePair;
