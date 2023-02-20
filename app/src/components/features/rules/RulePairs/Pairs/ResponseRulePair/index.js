import React, { useMemo } from "react";
import { Row, Col } from "antd";
import RequestSourceRow from "../Rows/RowsMarkup/RequestSourceRow";
import ResponseBodyRow from "../Rows/RowsMarkup/ResponseBodyRow";
import ResponseStatusCodeRow from "../Rows/RowsMarkup/ResponseStatusCodeRow";
import { isFeatureCompatible } from "utils/CompatibilityUtils";
import FEATURES from "config/constants/sub/features";

const ResponseRulePair = ({
  pair,
  pairIndex,
  helperFunctions,
  ruleDetails,
  isInputDisabled,
}) => {
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
