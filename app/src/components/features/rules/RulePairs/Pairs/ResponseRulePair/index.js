import React, { useEffect, useMemo } from "react";
import { Row, Col } from "antd";
import RequestSourceRow from "../Rows/RowsMarkup/RequestSourceRow";
import ResponseBodyRow from "../Rows/RowsMarkup/ResponseBodyRow";
import ResponseStatusCodeRow from "../Rows/RowsMarkup/ResponseStatusCodeRow";
import { isFeatureCompatible } from "utils/CompatibilityUtils";
import FEATURES from "config/constants/sub/features";
import GraphqlRequestPayload from "./GraphqlRequestPayload";
import "./ResponseRulePair.css";

const ResponseRulePair = ({
  pair,
  pairIndex,
  helperFunctions,
  ruleDetails,
  isInputDisabled,
  responseRuleResourceType = "",
  // setResponseRuleResourceType,
}) => {
  console.log("from editor", responseRuleResourceType, pair);
  const canOverrideStatus = useMemo(() => {
    return (
      isFeatureCompatible(FEATURES.MODIFY_API_RESPONSE_STATUS) &&
      window?.RQ?.DESKTOP?.VERSION !== "1.0"
    );
  }, []);

  // TODO: IMP
  useEffect(() => {
    // confirm when should the radio buttons should be visible
    // while creation or always
    // setResponseRuleResourceType();
  }, [pair.response.type]);

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

      <Row wrap={false} gutter={[20]} className="response-rule-inputs">
        {responseRuleResourceType === "graphqlApi" && (
          <Col span={12}>
            <GraphqlRequestPayload
              pairIndex={pairIndex}
              modifyPairAtGivenPath={helperFunctions?.modifyPairAtGivenPath}
            />
          </Col>
        )}

        {canOverrideStatus ? (
          <Col span={12}>
            <ResponseStatusCodeRow
              rowIndex={2}
              pair={pair}
              pairIndex={pairIndex}
              helperFunctions={helperFunctions}
              ruleDetails={ruleDetails}
              isInputDisabled={isInputDisabled}
            />
          </Col>
        ) : null}
      </Row>
      <Row>
        <Col span={24}>
          <ResponseBodyRow
            key={responseRuleResourceType}
            rowIndex={2}
            pair={pair}
            pairIndex={pairIndex}
            helperFunctions={helperFunctions}
            ruleDetails={ruleDetails}
            isInputDisabled={isInputDisabled}
            responseRuleResourceType={responseRuleResourceType}
          />
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default ResponseRulePair;
