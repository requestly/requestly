import React from "react";
import { Row, Col } from "antd";
import { useSelector } from "react-redux";
import { getResponseRuleResourceType } from "store/selectors";
import RequestSourceRow from "../Rows/RowsMarkup/RequestSourceRow";
import ResponseBodyRow from "../Rows/RowsMarkup/ResponseBodyRow";
import ResponseStatusCodeRow from "../Rows/RowsMarkup/ResponseStatusCodeRow";
import GraphqlRequestPayload from "./GraphqlRequestPayload";
import "./ResponseRulePair.css";
import { ResponseRule } from "@requestly/shared/types/entities/rules";

const ResponseRulePair = ({ pair, pairIndex, ruleDetails, isInputDisabled }) => {
  const responseRuleResourceType = useSelector(getResponseRuleResourceType);

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
      {responseRuleResourceType === ResponseRule.ResourceType.GRAPHQL_API && (
        <Row className="response-rule-inputs-row">
          <Col span={24}>
            <GraphqlRequestPayload pairIndex={pairIndex} isInputDisabled={isInputDisabled} />
          </Col>
        </Row>
      )}
      <Row className="response-rule-inputs-row">
        <Col span={24}>
          <ResponseStatusCodeRow rowIndex={2} pair={pair} pairIndex={pairIndex} isInputDisabled={isInputDisabled} />
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <ResponseBodyRow
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

export default ResponseRulePair;
