import React, { useMemo, useState } from "react";
import { Row, Col } from "antd";
import { useSelector } from "react-redux";
import { getCurrentlySelectedRuleData, getResponseRuleResourceType } from "store/selectors";
import RequestSourceRow from "../Rows/RowsMarkup/RequestSourceRow";
import ResponseBodyRow from "../Rows/RowsMarkup/ResponseBodyRow";
import ResponseStatusCodeRow from "../Rows/RowsMarkup/ResponseStatusCodeRow";
import GraphqlRequestPayload from "./GraphqlRequestPayload";
import { ResponseRuleResourceType } from "types/rules";
import getObjectValue from "../../Filters/actions/getObjectValue";
import APP_CONSTANTS from "config/constants";
import "./ResponseRulePair.css";

const {
  PATH_FROM_PAIR: { SOURCE_REQUEST_PAYLOAD_KEY, SOURCE_REQUEST_PAYLOAD_VALUE, SOURCE_REQUEST_PAYLOAD_OPERATOR },
} = APP_CONSTANTS;

const ResponseRulePair = ({ pair, pairIndex, ruleDetails, isInputDisabled }) => {
  const currentlySelectedRuleData = useSelector(getCurrentlySelectedRuleData);
  const responseRuleResourceType = useSelector(getResponseRuleResourceType);
  const currentPayloadKey = useMemo(
    () => getObjectValue(currentlySelectedRuleData, pairIndex, SOURCE_REQUEST_PAYLOAD_KEY),
    [pairIndex, currentlySelectedRuleData]
  );

  const currentPayloadOperator = useMemo(
    () => getObjectValue(currentlySelectedRuleData, pairIndex, SOURCE_REQUEST_PAYLOAD_OPERATOR),
    [pairIndex, currentlySelectedRuleData]
  );

  const currentPayloadValue = useMemo(
    () => getObjectValue(currentlySelectedRuleData, pairIndex, SOURCE_REQUEST_PAYLOAD_VALUE),
    [pairIndex, currentlySelectedRuleData]
  );

  const [gqlOperationFilter, setGqlOperationFilter] = useState({
    key: currentPayloadKey,
    operator: currentPayloadOperator,
    value: currentPayloadValue,
  });

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
      {responseRuleResourceType === ResponseRuleResourceType.GRAPHQL_API && (
        <Row className="response-rule-inputs-row">
          <Col span={24}>
            <GraphqlRequestPayload
              pairIndex={pairIndex}
              gqlOperationFilter={gqlOperationFilter}
              setGqlOperationFilter={setGqlOperationFilter}
            />
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
