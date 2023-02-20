import React, { useCallback, useEffect } from "react";
import QueryParamModificationRow from "../Rows/RowsMarkup/QueryParamModificationRow";
import RequestSourceRow from "../Rows/RowsMarkup/RequestSourceRow";
import AddQueryParamModificationRow from "../Rows/RowsMarkup/AddQueryParamModificationRow";
import { generateObjectId } from "../../../../../../utils/FormattingHelper";
import { Row, Col } from "antd";

const QueryParamRulePair = ({
  pair,
  pairIndex,
  helperFunctions,
  ruleDetails,
  isInputDisabled,
}) => {
  const {
    pushValueToArrayInPair,
    deleteArrayValueByIndexInPair,
  } = helperFunctions;

  const getEmptyModification = () => {
    return { ...ruleDetails.EMPTY_MODIFICATION_FORMAT, id: generateObjectId() };
  };
  const addEmptyModification = (event) => {
    pushValueToArrayInPair(
      event,
      pairIndex,
      "modifications",
      stableGetEmptyModification()
    );
  };

  const stableGetEmptyModification = useCallback(getEmptyModification, [
    ruleDetails.EMPTY_MODIFICATION_FORMAT,
  ]);

  const stableAddEmptyModification = useCallback(addEmptyModification, [
    stableGetEmptyModification,
    pairIndex,
    pushValueToArrayInPair,
  ]);

  const initializeQueryParamRule = () => {
    stableAddEmptyModification();
  };

  const stableInitializeQueryParamRule = useCallback(initializeQueryParamRule, [
    stableAddEmptyModification,
  ]);

  const deleteModification = (event, pairIndex, modificationIndex) => {
    deleteArrayValueByIndexInPair(
      event,
      pairIndex,
      "modifications",
      modificationIndex
    );
  };

  useEffect(() => {
    if (pair.modifications.length === 0) {
      stableInitializeQueryParamRule();
    }
  }, [stableInitializeQueryParamRule, pair.modifications.length]);

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
      {pair.modifications.map((modification, modificationIndex) => (
        <Row key={modificationIndex} align="middle">
          <Col span={24}>
            <QueryParamModificationRow
              key={modification.id}
              rowIndex={2}
              pair={pair}
              pairIndex={pairIndex}
              helperFunctions={{ ...helperFunctions, deleteModification }}
              modification={modification}
              modificationIndex={modificationIndex}
              isInputDisabled={isInputDisabled}
            />
          </Col>
        </Row>
      ))}

      <Row>
        <Col span={24}>
          <AddQueryParamModificationRow
            rowIndex={3}
            pair={pair}
            pairIndex={pairIndex}
            helperFunctions={{ ...helperFunctions, addEmptyModification }}
            isInputDisabled={isInputDisabled}
          />
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default QueryParamRulePair;
