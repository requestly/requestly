import React, { useCallback } from "react";
import { useDispatch } from "react-redux";
import { Row, Col, Input } from "antd";
import { actions } from "store";

const ReplacePartRow = ({ rowIndex, pair, pairIndex, isInputDisabled }) => {
  const dispatch = useDispatch();

  const handleInputChange = useCallback(
    (event, pairIndex, path) => {
      event?.preventDefault?.();

      dispatch(
        actions.updateRulePairAtGivenPath({
          pairIndex,
          newValue: event?.target?.value,
          objectPath: path,
        })
      );
    },
    [dispatch]
  );

  return (
    <Row align="middle" key={rowIndex} span={24} gutter={16} className="margin-top-one">
      <Col span={12} data-tour-id="rule-editor-replace-from">
        <Input
          type="text"
          value={pair.from}
          addonBefore="Replace"
          placeholder="This part in URL"
          disabled={isInputDisabled}
          onChange={(event) => handleInputChange(event, pairIndex, "from")}
          data-selectionid="replace-from-in-url"
        />
      </Col>
      <Col span={12} data-tour-id="rule-editor-replace-to">
        <Input
          type="text"
          value={pair.to}
          addonBefore="With"
          placeholder="This part"
          disabled={isInputDisabled}
          onChange={(event) => handleInputChange(event, pairIndex, "to")}
          data-selectionid="replace-to-in-url"
        />
      </Col>
    </Row>
  );
};

export default ReplacePartRow;
