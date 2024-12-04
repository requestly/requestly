import { Row, Col } from "antd";
import { useDispatch } from "react-redux";
import { RQInput } from "lib/design-system/components";
import { globalActions } from "store/slices/global/slice";
import "./delayRow.css";

const DelayRow = ({ rowIndex, pair, pairIndex, isInputDisabled }) => {
  const dispatch = useDispatch();

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
          onChange={(event) =>
            dispatch(
              globalActions.updateRulePairAtGivenPath({
                pairIndex,
                updates: {
                  delay: event?.target?.value,
                },
              })
            )
          }
          data-selectionid="delay-value"
        />
      </Col>
    </Row>
  );
};

export default DelayRow;
