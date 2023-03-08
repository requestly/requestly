import React, { useMemo } from "react";
import { Row, Col } from "antd";
import RequestSourceRow from "../Rows/RowsMarkup/RequestSourceRow";
import ResponseBodyRow from "../Rows/RowsMarkup/ResponseBodyRow";
import ResponseStatusCodeRow from "../Rows/RowsMarkup/ResponseStatusCodeRow";
import { isFeatureCompatible } from "utils/CompatibilityUtils";
import FEATURES from "config/constants/sub/features";
import GraphqlRequestPayload from "./GraphqlRequestPayload";

const ResponseRulePair = ({
  pair,
  pairIndex,
  helperFunctions,
  ruleDetails,
  isInputDisabled,
  responseRuleResourceType = "",
}) => {
  console.log("from editor", responseRuleResourceType, pair);
  const canOverrideStatus = useMemo(() => {
    return (
      isFeatureCompatible(FEATURES.MODIFY_API_RESPONSE_STATUS) &&
      window?.RQ?.DESKTOP?.VERSION !== "1.0"
    );
  }, []);

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

      {responseRuleResourceType === "graphqlApi" && (
        <GraphqlRequestPayload
          pairIndex={pairIndex}
          modifyPairAtGivenPath={helperFunctions?.modifyPairAtGivenPath}
        />
      )}

      {canOverrideStatus ? (
        <Row>
          <Col span={24}>
            <ResponseStatusCodeRow
              rowIndex={2}
              pair={pair}
              pairIndex={pairIndex}
              helperFunctions={helperFunctions}
              ruleDetails={ruleDetails}
              isInputDisabled={isInputDisabled}
            />
          </Col>
        </Row>
      ) : null}
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
