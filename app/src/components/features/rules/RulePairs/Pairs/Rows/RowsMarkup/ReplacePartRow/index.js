import React, { useCallback } from "react";
import { useDispatch } from "react-redux";
import { Row, Col, Input } from "antd";
import { actions } from "store";
import "./ReplacePartRow.css";

const ReplacePartRow = ({ rowIndex, pair, pairIndex, isInputDisabled }) => {
  const dispatch = useDispatch();

  const handleInputChange = useCallback(
    (e, path) => {
      e?.preventDefault?.();

      dispatch(
        actions.updateRulePairAtGivenPath({
          pairIndex,
          updates: {
            [path]: e?.target?.value,
          },
        })
      );
    },
    [dispatch, pairIndex]
  );

  return (
    <Row align="middle" key={rowIndex} span={24} gutter={16} className="margin-top-one replace-part-row">
      <Col span={12} data-tour-id="rule-editor-replace-from">
        <Input
          type="text"
          value={pair.from}
          addonBefore="Replace"
          placeholder="This part in URL"
          disabled={isInputDisabled}
          onChange={(e) => handleInputChange(e, "from")}
          data-selectionid="replace-from-in-url"
          className="replace-from"
        />
      </Col>
      <Col span={12} data-tour-id="rule-editor-replace-to">
        <Input
          type="text"
          value={pair.to}
          addonBefore="With"
          placeholder="This part"
          disabled={isInputDisabled}
          onChange={(e) => handleInputChange(e, "to")}
          data-selectionid="replace-to-in-url"
          className="replace-to"
        />
      </Col>
    </Row>
  );
};

export default ReplacePartRow;
