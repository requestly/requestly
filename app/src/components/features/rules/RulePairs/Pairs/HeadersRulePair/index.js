import React from "react";
import ModifyHeaderRow from "../Rows/RowsMarkup/ModifyHeaderRow";
import RequestSourceRow from "../Rows/RowsMarkup/RequestSourceRow";
import { Row, Col } from "antd";

const HeadersRulePair = ({ isSuperRule, ruleId, pair, pairIndex, ruleDetails, isInputDisabled }) =>
  isSuperRule ? (
    <React.Fragment>
      <Row>
        <Col span={24}>
          <ModifyHeaderRow
            isSuperRule={isSuperRule}
            ruleId={ruleId}
            rowIndex={1}
            pair={pair}
            pairIndex={pairIndex}
            isInputDisabled={isInputDisabled}
            ruleDetails={ruleDetails}
          />
        </Col>
      </Row>
    </React.Fragment>
  ) : (
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
          <ModifyHeaderRow
            rowIndex={1}
            pair={pair}
            pairIndex={pairIndex}
            isInputDisabled={isInputDisabled}
            ruleDetails={ruleDetails}
          />
        </Col>
      </Row>
    </React.Fragment>
  );

export default HeadersRulePair;
