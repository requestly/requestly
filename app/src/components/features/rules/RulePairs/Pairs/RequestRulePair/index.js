import React from "react";
import { Row, Col } from "antd";
import RequestSourceRow from "../Rows/RowsMarkup/RequestSourceRow";
import RequestBodyRow from "../Rows/RowsMarkup/RequestBodyRow";
import { RequestRule } from "@requestly/shared/types/entities/rules";
import GraphqlRequestPayload from "../ResponseRulePair/GraphqlRequestPayload";
import { getRequestRuleResourceType } from "store/selectors";
import { useSelector } from "react-redux";

const RequestRulePair = ({ pair, pairIndex, ruleDetails, isInputDisabled }) => {
  const requestRuleResourceType = useSelector(getRequestRuleResourceType);

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
      {requestRuleResourceType === RequestRule.ResourceType.GRAPHQL_API && (
        <Row className="response-rule-inputs-row">
          <Col span={24}>
            <GraphqlRequestPayload pairIndex={pairIndex} isInputDisabled={isInputDisabled} />
          </Col>
        </Row>
      )}
      <Row>
        <Col span={24}>
          <RequestBodyRow
            rowIndex={2}
            pair={pair}
            pairIndex={pairIndex}
            ruleDetails={ruleDetails}
            isInputDisabled={isInputDisabled}
          />
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default RequestRulePair;
