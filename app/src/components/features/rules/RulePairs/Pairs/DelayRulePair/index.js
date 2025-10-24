import { Row, Col } from "antd";
import DelayRow from "../Rows/RowsMarkup/DelayRow";
import RequestSourceRow from "../Rows/RowsMarkup/RequestSourceRow";

const DelayRulePair = ({ pair, pairIndex, ruleDetails, isInputDisabled }) => (
  <Row gutter={[16, 16]} align="middle">
    <Col span={24} xl={15}>
      <RequestSourceRow
        rowIndex={1}
        pair={pair}
        pairIndex={pairIndex}
        ruleDetails={ruleDetails}
        isInputDisabled={isInputDisabled}
      />
    </Col>

    <Col span={24} md={11} xl={9}>
      <DelayRow
        rowIndex={2}
        pair={pair}
        pairIndex={pairIndex}
        ruleDetails={ruleDetails}
        isInputDisabled={isInputDisabled}
      />
    </Col>
  </Row>
);

export default DelayRulePair;
