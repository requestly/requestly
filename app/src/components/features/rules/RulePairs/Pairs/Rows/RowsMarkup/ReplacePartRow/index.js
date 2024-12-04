import React, { useCallback } from "react";
import { useDispatch } from "react-redux";
import { Row, Col, Input } from "antd";
import { globalActions } from "store/slices/global/slice";

const ReplacePartRow = ({ rowIndex, pair, pairIndex, isInputDisabled }) => {
  const dispatch = useDispatch();

  const handleInputChange = useCallback(
    (e, path) => {
      e?.preventDefault?.();

      dispatch(
        globalActions.updateRulePairAtGivenPath({
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
    <Row align="middle" key={rowIndex} span={24} gutter={16} className="margin-top-one">
      <Col span={12} data-tour-id="rule-editor-replace-from">
        <Input
          type="text"
          value={pair.from}
          addonBefore="Replace"
          placeholder="This part in URL"
          disabled={isInputDisabled}
          onChange={(e) => handleInputChange(e, "from")}
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
          onChange={(e) => handleInputChange(e, "to")}
          data-selectionid="replace-to-in-url"
        />
      </Col>
    </Row>
  );
};

export default ReplacePartRow;
