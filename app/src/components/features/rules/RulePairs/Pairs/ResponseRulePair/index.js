import React, { useMemo, useState } from "react";
import { Row, Col } from "antd";
import { useSelector } from "react-redux";
import { getCurrentlySelectedRuleData, getResponseRuleResourceType } from "store/selectors";
import RequestSourceRow from "../Rows/RowsMarkup/RequestSourceRow";
import ResponseBodyRow from "../Rows/RowsMarkup/ResponseBodyRow";
import ResponseStatusCodeRow from "../Rows/RowsMarkup/ResponseStatusCodeRow";
import { isFeatureCompatible } from "utils/CompatibilityUtils";
import FEATURES from "config/constants/sub/features";
import GraphqlRequestPayload from "./GraphqlRequestPayload";
import { ResponseRuleResourceType } from "types/rules";
import getObjectValue from "../../Filters/actions/getObjectValue";
import APP_CONSTANTS from "config/constants";
import "./ResponseRulePair.css";

const {
  PATH_FROM_PAIR: { SOURCE_REQUEST_PAYLOAD_KEY, SOURCE_REQUEST_PAYLOAD_VALUE },
} = APP_CONSTANTS;

const ResponseRulePair = ({ pair, pairIndex, helperFunctions, ruleDetails, isInputDisabled }) => {
  const currentlySelectedRuleData = useSelector(getCurrentlySelectedRuleData);
  const responseRuleResourceType = useSelector(getResponseRuleResourceType);
  const currentPayloadKey = useMemo(
    () => getObjectValue(currentlySelectedRuleData, pairIndex, SOURCE_REQUEST_PAYLOAD_KEY),
    [pairIndex, currentlySelectedRuleData]
  );

  const currentPayloadValue = useMemo(
    () => getObjectValue(currentlySelectedRuleData, pairIndex, SOURCE_REQUEST_PAYLOAD_VALUE),
    [pairIndex, currentlySelectedRuleData]
  );

  const [gqlOperationFilter, setGqlOperationFilter] = useState({
    key: currentPayloadKey,
    value: currentPayloadValue,
  });

  const canOverrideStatus = useMemo(() => {
    return isFeatureCompatible(FEATURES.MODIFY_API_RESPONSE_STATUS) && window?.RQ?.DESKTOP?.VERSION !== "1.0";
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

      <Row wrap={false} gutter={[20]} className="response-rule-inputs">
        {responseRuleResourceType === ResponseRuleResourceType.GRAPHQL_API && (
          <Col span={12}>
            <GraphqlRequestPayload
              pairIndex={pairIndex}
              gqlOperationFilter={gqlOperationFilter}
              setGqlOperationFilter={setGqlOperationFilter}
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
            rowIndex={2}
            pair={pair}
            pairIndex={pairIndex}
            helperFunctions={helperFunctions}
            ruleDetails={ruleDetails}
            isInputDisabled={isInputDisabled}
          />
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default ResponseRulePair;
