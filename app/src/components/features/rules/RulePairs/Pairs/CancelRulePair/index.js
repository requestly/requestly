import React from "react";
import RequestSourceRow from "../Rows/RowsMarkup/RequestSourceRow";

const CancelRulePair = ({ isSuperRule, ruleId, pair, pairIndex, ruleDetails, isInputDisabled }) =>
  isSuperRule ? (
    <div>Cancel rule added</div>
  ) : (
    <RequestSourceRow
      rowIndex={1}
      pair={pair}
      pairIndex={pairIndex}
      ruleDetails={ruleDetails}
      isInputDisabled={isInputDisabled}
    />
  );

export default CancelRulePair;
