import { Row, Col } from "antd";
import { RQInput } from "lib/design-system/components";
import "./delayRow.css";

const DelayRow = ({ rowIndex, pair, pairIndex, helperFunctions, isInputDisabled }) => {
  const { modifyPairAtGivenPath } = helperFunctions;

  return (
    <Row align="middle" key={rowIndex}>
      <Col align="right" span={24} data-tour-id="rule-editor-delay-value">
        <RQInput
          type="text"
          value={pair.delay}
          placeholder="Time in ms"
          disabled={isInputDisabled}
          className="delay-rule-input display-inline-block"
          addonBefore={<span className="text-gray">DELAY (ms):</span>}
          onChange={(event) => modifyPairAtGivenPath(event, pairIndex, "delay")}
          data-selectionid="delay-value"
        />
      </Col>
    </Row>
  );
};

export default DelayRow;
