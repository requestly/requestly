import React from "react";
import UserAgentSelectionRow from "../Rows/RowsMarkup/UserAgentSelectionRow";
import RequestSourceRow from "../Rows/RowsMarkup/RequestSourceRow";
import { Row, Col } from "antd";

const UserAgentRulePair = ({ pair, pairIndex, helperFunctions, ruleDetails, isInputDisabled }) => {
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
          <UserAgentSelectionRow
            rowIndex={2}
            pair={pair}
            pairIndex={pairIndex}
            helperFunctions={helperFunctions}
            isInputDisabled={isInputDisabled}
          />
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default UserAgentRulePair;
