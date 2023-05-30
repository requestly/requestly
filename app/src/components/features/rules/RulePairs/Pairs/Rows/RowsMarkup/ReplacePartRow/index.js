import React from "react";
import { Row, Col, Input } from "antd";

const ReplacePartRow = ({ rowIndex, pair, pairIndex, helperFunctions, isInputDisabled }) => {
  const { modifyPairAtGivenPath } = helperFunctions;
  return (
    <Row align="middle" key={rowIndex} span={24} gutter={16} className="margin-top-one">
      <Col span={12}>
        <Input
          type="text"
          value={pair.from}
          addonBefore="Replace"
          placeholder="This part in URL"
          disabled={isInputDisabled}
          onChange={(event) => modifyPairAtGivenPath(event, pairIndex, "from")}
          data-selectionid="replace-from-in-url"
          data-tour-id="rule-editor-replace-from"
        />
      </Col>
      <Col span={12}>
        <Input
          type="text"
          value={pair.to}
          addonBefore="With"
          placeholder="This part"
          disabled={isInputDisabled}
          onChange={(event) => modifyPairAtGivenPath(event, pairIndex, "to")}
          data-selectionid="replace-to-in-url"
          data-tour-id="rule-editor-replace-to"
        />
      </Col>
    </Row>
  );
};

export default ReplacePartRow;
