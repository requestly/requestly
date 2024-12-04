import React, { useCallback, useEffect } from "react";
import { useDispatch } from "react-redux";
import { globalActions } from "store/slices/global/slice";
import QueryParamModificationRow from "../Rows/RowsMarkup/QueryParamModificationRow";
import RequestSourceRow from "../Rows/RowsMarkup/RequestSourceRow";
import AddQueryParamModificationRow from "../Rows/RowsMarkup/AddQueryParamModificationRow";
import { generateObjectId } from "../../../../../../utils/FormattingHelper";
import { Row, Col } from "antd";

const QueryParamRulePair = ({ pair, pairIndex, ruleDetails, isInputDisabled }) => {
  const dispatch = useDispatch();

  const getEmptyModification = useCallback(() => {
    return { ...ruleDetails.EMPTY_MODIFICATION_FORMAT, id: generateObjectId() };
  }, [ruleDetails.EMPTY_MODIFICATION_FORMAT]);

  const addEmptyModification = useCallback(
    (event) => {
      event?.preventDefault?.();

      dispatch(
        globalActions.addValueInRulePairArray({
          pairIndex,
          arrayPath: "modifications",
          value: getEmptyModification(),
        })
      );
    },
    [dispatch, pairIndex, getEmptyModification]
  );

  useEffect(() => {
    if (pair.modifications.length === 0) {
      addEmptyModification();
    }
  }, [addEmptyModification, pair.modifications.length]);

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
      {pair?.modifications?.length > 0 &&
        pair.modifications.map((modification, modificationIndex) => (
          <Row key={modificationIndex} align="middle">
            <Col span={24}>
              <QueryParamModificationRow
                key={modification.id}
                rowIndex={2}
                pair={pair}
                pairIndex={pairIndex}
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
            addEmptyModification={addEmptyModification}
            isInputDisabled={isInputDisabled}
          />
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default QueryParamRulePair;
