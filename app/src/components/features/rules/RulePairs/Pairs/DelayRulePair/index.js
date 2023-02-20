import { Row, Col } from "antd";
import DelayRow from "../Rows/RowsMarkup/DelayRow";
import RequestSourceRow from "../Rows/RowsMarkup/RequestSourceRow";

const DelayRulePair = ({
  pair,
  pairIndex,
  helperFunctions,
  ruleDetails,
  isInputDisabled,
}) => (
  <Row gutter={16} align="middle">
    <Col span={15} lg={17}>
      <RequestSourceRow
        rowIndex={1}
        pair={pair}
        pairIndex={pairIndex}
        helperFunctions={helperFunctions}
        ruleDetails={ruleDetails}
        isInputDisabled={isInputDisabled}
      />
    </Col>

    <Col span={9} lg={7}>
      <DelayRow
        rowIndex={2}
        pair={pair}
        pairIndex={pairIndex}
        helperFunctions={helperFunctions}
        ruleDetails={ruleDetails}
        isInputDisabled={isInputDisabled}
      />
    </Col>
  </Row>
);

export default DelayRulePair;
