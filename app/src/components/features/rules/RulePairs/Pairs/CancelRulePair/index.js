import React from "react";
import RequestSourceRow from "../Rows/RowsMarkup/RequestSourceRow";
import { MoreInfo } from "components/misc/MoreInfo";

const CancelRulePair = ({ isSuperRule, ruleId, pair, pairIndex, ruleDetails, isInputDisabled }) =>
  isSuperRule ? (
    <div>
      <RequestSourceRow
        rowIndex={1}
        pair={pair}
        pairIndex={pairIndex}
        ruleDetails={ruleDetails}
        isInputDisabled={true}
      />
    </div>
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
